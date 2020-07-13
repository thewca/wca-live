defmodule WcaLive.Scoretaking do
  import Ecto.Query, warn: false
  alias Ecto.{Changeset, Multi}
  alias WcaLive.Repo

  alias WcaLive.Competitions.Person
  alias WcaLive.Wca
  alias WcaLive.Wca.{Country, Format, Event}
  alias WcaLive.Scoretaking.{AdvancementCondition, AttemptResult, Result, Round}

  @doc """
  Gets a single round.
  """
  def get_round(id), do: Repo.get(Round, id)

  @doc """
  Gets a single round.
  """
  def get_round!(id), do: Repo.get!(Round, id)

  def get_previous_round(round) do
    Repo.one(
      from r in Round,
        where:
          r.competition_event_id == ^round.competition_event_id and
            r.number == ^round.number - 1
    )
  end

  def get_next_round(round) do
    Repo.one(
      from r in Round,
        where:
          r.competition_event_id == ^round.competition_event_id and
            r.number == ^round.number + 1
    )
  end

  @doc """
  Gets a single result.
  """
  def get_result!(id), do: Repo.get!(Result, id)

  def update_result(result, attrs) do
    result = Repo.preload(result, round: [:competition_event])

    Multi.new()
    |> Multi.update(:updated_result, fn _changes ->
      format = Format.get_by_id!(result.round.format_id)
      event_id = result.round.competition_event.event_id
      Result.changeset(result, attrs, event_id, format.number_of_attempts)
    end)
    |> Multi.merge(fn %{updated_result: result} ->
      process_round_after_results_change(result.round)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, _} -> {:ok, get_round!(result.round_id)}
      {:error, _, reason, _} -> {:error, reason}
    end
  end

  defp process_round_after_results_change(round) do
    Multi.new()
    |> Multi.update(:compute_ranking, fn _ ->
      compute_ranking(round)
    end)
    |> Multi.update(:compute_advancing, fn %{compute_ranking: round} ->
      # Note: advancement usually depends on ranking, that's why we compute it first.
      compute_advancing(round)
    end)
    |> Multi.update(:compute_record_tags, fn %{compute_advancing: round} ->
      competition_event = round |> Ecto.assoc(:competition_event) |> Repo.one!()
      compute_record_tags(competition_event)
    end)
  end

  defp compute_ranking(round) do
    round = round |> Repo.preload(:results)
    results = round.results
    format = Format.get_by_id!(round.format_id)

    {empty, nonempty} = Enum.split_with(results, fn result -> Enum.empty?(result.attempts) end)

    empty_with_ranking = Enum.map(empty, fn result -> {result, nil} end)

    nonempty_with_ranking =
      nonempty
      |> Enum.sort_by(&result_to_monotnic(&1, format.sort_by))
      |> Enum.with_index(1)
      |> Enum.reduce([], fn
        {result, ranking}, [] ->
          [{result, ranking}]

        {result, ranking}, [{prev_result, prev_ranking} | _] = pairs ->
          if results_equal?(result, prev_result, format.sort_by) do
            [{result, prev_ranking} | pairs]
          else
            [{result, ranking} | pairs]
          end
      end)

    (empty_with_ranking ++ nonempty_with_ranking)
    |> Enum.map(fn {result, ranking} ->
      Changeset.change(result, ranking: ranking)
    end)
    |> put_results_in_round(round)
  end

  defp result_to_monotnic(result, :best = _sort_by) do
    AttemptResult.to_monotonic(result.best)
  end

  defp result_to_monotnic(result, :average = _sort_by) do
    {AttemptResult.to_monotonic(result.average), AttemptResult.to_monotonic(result.best)}
  end

  defp results_equal?(result1, result2, sort_by) do
    result_to_monotnic(result1, sort_by) == result_to_monotnic(result2, sort_by)
  end

  defp put_results_in_round(results, round) do
    round |> Changeset.change() |> Changeset.put_assoc(:results, results)
  end

  # Updating a result with record may affect subsequent round results,
  # so we compute proper record tags for all rounds of the given event.
  defp compute_record_tags(competition_event) do
    competition_event =
      competition_event
      |> Repo.preload(rounds: [:competition_event, results: [person: [:personal_bests]]])

    rounds = competition_event.rounds
    event_id = competition_event.event_id

    regional_records = Wca.RecordsStore.get_regional_records()

    personal_records =
      hd(rounds).results
      |> Enum.map(& &1.person)
      |> Enum.map(&person_records/1)
      |> Enum.reduce(%{}, &merge_records/2)

    records = merge_records(regional_records, personal_records)

    {round_changesets, _records} =
      Enum.map_reduce(rounds, records, fn round, records ->
        records = round |> round_records() |> merge_records(records)

        round_changeset =
          round.results
          |> Enum.map(fn result ->
            single_record_tag =
              tags_with_record_key(result.person, event_id, "single")
              |> Enum.find_value(fn %{record_key: record_key, tag: tag} ->
                if result.best == records[record_key], do: tag, else: nil
              end)

            average_record_tag =
              tags_with_record_key(result.person, event_id, "average")
              |> Enum.find_value(fn %{record_key: record_key, tag: tag} ->
                if result.average == records[record_key], do: tag, else: nil
              end)

            Changeset.change(result,
              single_record_tag: single_record_tag,
              average_record_tag: average_record_tag
            )
          end)
          |> put_results_in_round(round)

        {round_changeset, records}
      end)

    competition_event
    |> Changeset.change()
    |> Changeset.put_assoc(:rounds, round_changesets)
  end

  defp tags_with_record_key(person, event_id, type) do
    country = Country.get_by_iso2!(person.country_iso2)

    [
      %{tag: "WR", record_key: Wca.Records.record_key(event_id, type, "world")},
      %{tag: "CR", record_key: Wca.Records.record_key(event_id, type, country.continent_name)},
      %{tag: "NR", record_key: Wca.Records.record_key(event_id, type, country.iso2)},
      %{
        tag: "PB",
        record_key: Wca.Records.record_key(event_id, type, person_record_scope(person))
      }
    ]
  end

  defp person_record_scope(person), do: "person:" <> to_string(person.id)

  defp person_records(person) do
    Map.new(person.personal_bests, fn %{event_id: event_id, type: type, best: best} ->
      {Wca.Records.record_key(event_id, type, person_record_scope(person)), best}
    end)
  end

  defp round_records(round) do
    results = round.results
    event_id = round.competition_event.event_id

    single_records =
      results
      |> Enum.filter(fn result -> AttemptResult.complete?(result.best) end)
      |> Enum.flat_map(fn result ->
        tags_with_record_key(result.person, event_id, "single")
        |> Enum.map(fn %{record_key: record_key} -> {record_key, result.best} end)
      end)
      |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))
      |> Map.new(fn {record_key, values} -> {record_key, Enum.min(values)} end)

    average_records =
      results
      |> Enum.filter(fn result -> AttemptResult.complete?(result.average) end)
      |> Enum.flat_map(fn result ->
        tags_with_record_key(result.person, event_id, "average")
        |> Enum.map(fn %{record_key: record_key} -> {record_key, result.average} end)
      end)
      |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))
      |> Map.new(fn {record_key, values} -> {record_key, Enum.min(values)} end)

    Map.merge(single_records, average_records)
  end

  defp merge_records(records1, records2) do
    Map.merge(records1, records2, fn _record_key, value1, value2 ->
      min(value1, value2)
    end)
  end

  # Wording note:
  #
  #   - **advancing** - actually being in the next round (the "green" results)
  #   - **qualifying** - satisfying advancement criteria
  defp compute_advancing(round) do
    round = round |> Repo.preload(:results)
    advancing = advancing_results(round)

    Enum.map(round.results, fn result ->
      Changeset.change(result, advancing: result in advancing)
    end)
    |> put_results_in_round(round)
  end

  defp advancing_results(round) do
    next = get_next_round(round) |> Repo.preload(:results)

    if next != nil and Round.open?(next) do
      # If the next round is open use its results to determine who advanced.
      advancing_person_ids = Enum.map(next.results, & &1.person_id)

      Enum.filter(round.results, fn result ->
        result.person_id in advancing_person_ids
      end)
    else
      qualifying_results(round)
    end
  end

  defp qualifying_results(%Round{results: []}), do: []

  defp qualifying_results(%Round{advancement_condition: nil} = round) do
    # Mark top 3 in the finals (unless DNFed).
    Enum.filter(round.results, fn result ->
      result.best > 0 and result.ranking != nil and result.ranking <= 3
    end)
  end

  defp qualifying_results(round) do
    %{results: results, advancement_condition: advancement_condition, format_id: format_id} =
      round

    format = Format.get_by_id!(format_id)

    # See: https://www.worldcubeassociation.org/regulations/#9p1
    max_qualifying = floor(length(results) * 0.75)
    rankings = results |> Enum.map(& &1.ranking) |> Enum.reject(&is_nil/1) |> Enum.sort()

    first_non_qualifying_ranking =
      if length(rankings) > max_qualifying do
        Enum.fetch!(rankings, max_qualifying)
      else
        if Enum.empty?(rankings), do: 1, else: List.last(rankings) + 1
      end

    Enum.filter(results, fn result ->
      # Note: this ensures that people who tied either qualify together or not.
      result.ranking != nil and
        result.ranking < first_non_qualifying_ranking and
        result.best > 0 and
        satisfies_advancement_condition?(result, advancement_condition, length(results), format)
    end)
  end

  defp satisfies_advancement_condition?(
         result,
         %AdvancementCondition{type: "ranking", level: level},
         _total_results,
         _format
       ) do
    result.ranking <= level
  end

  defp satisfies_advancement_condition?(
         result,
         %AdvancementCondition{type: "percent", level: level},
         total_results,
         _format
       ) do
    result.ranking <= floor(total_results * level * 0.01)
  end

  defp satisfies_advancement_condition?(
         result,
         %AdvancementCondition{type: "attemptResult", level: level},
         _total_results,
         format
       ) do
    AttemptResult.better?(Map.get(result, format.sort_by), level)
  end

  def open_round(round) do
    round = round |> Repo.preload(:results)
    previous = get_previous_round(round) |> Repo.preload(:results)

    if Round.open?(round) do
      {:error, "cannot open this round as it is already open"}
    else
      Multi.new()
      |> Multi.run(:finish_previous, fn _repo, _changes ->
        if previous do
          finish_round(previous)
        else
          {:ok, nil}
        end
      end)
      |> Multi.run(:create_results, fn _repo, %{finish_previous: previous} ->
        create_empty_results(round, previous)
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{create_results: round}} -> {:ok, round}
        {:error, _, reason, _} -> {:error, reason}
      end
    end
  end

  # Finishes `round` by removing empty results, so that the next round may be opened.
  defp finish_round(round) do
    actual_results = Enum.reject(round.results, &Result.empty?/1)

    if length(actual_results) < 8 do
      # See: https://www.worldcubeassociation.org/regulations/#9m3
      {:error, "rounds with less than 8 competitors cannot have a subsequent round"}
    else
      # Note: we remove empty results, so we need to recompute advancing results,
      # because an advancement condition may depend on the total number of results (i.e. "percent" type).

      Multi.new()
      |> Multi.update(:remove_empty, put_results_in_round(actual_results, round))
      |> Multi.update(:recompute_advancing, fn %{remove_empty: round} ->
        compute_advancing(round)
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{recompute_advancing: round}} -> {:ok, round}
        {:error, _, reason, _} -> {:error, reason}
      end
    end
  end

  defp create_empty_results(round, previous) do
    empty_results =
      person_ids_for_round(round, previous)
      |> Enum.map(&empty_result_for_person_id/1)

    if Enum.empty?(empty_results) do
      {:error,
       "cannot open this round as no one #{if previous, do: "qualified", else: "registered"}"}
    else
      round
      |> Changeset.change()
      |> Changeset.put_assoc(:results, empty_results)
      |> Repo.update()
    end
  end

  defp person_ids_for_round(round, previous) do
    %{event_id: event_id} = round |> Ecto.assoc(:competition_event) |> Repo.one!()

    if previous do
      previous.results
      |> Enum.filter(& &1.advancing)
      |> Enum.map(& &1.person_id)
    else
      people =
        round
        |> Ecto.assoc([:competition_event, :competition, :people])
        |> Repo.all()
        |> Repo.preload(:registration)

      people
      |> Enum.filter(&Person.competitor?/1)
      |> Enum.filter(fn person -> event_id in person.registration.event_ids end)
      |> Enum.map(& &1.id)
    end
  end

  def empty_result_for_person_id(person_id) do
    %Result{}
    |> Changeset.change()
    |> Changeset.put_change(:person_id, person_id)
  end

  def clear_round(round) do
    round = round |> Repo.preload(:results)
    next = get_next_round(round) |> Repo.preload(:results)

    if next && Round.open?(next) do
      {:error, "cannot clear this round as the next one is already open"}
    else
      put_results_in_round([], round)
      |> update_round_and_previous_advancing()
    end
  end

  defp update_round_and_previous_advancing(round_changeset) do
    Multi.new()
    |> Multi.update(:round, round_changeset)
    |> Multi.run(:previous, fn _, %{round: round} ->
      previous = get_previous_round(round) |> Repo.preload(:results)

      if previous == nil do
        {:ok, nil}
      else
        previous |> compute_advancing() |> Repo.update()
      end
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{round: round}} -> {:ok, round}
      {:error, _, reason, _} -> {:error, reason}
    end
  end

  @type record :: %{
          id: String.t(),
          result: %Result{},
          type: String.t(),
          record_tag: String.t(),
          attempt_result: integer()
        }

  @spec list_recent_records() :: list(record())
  def list_recent_records(opts \\ []) do
    days = Keyword.get(opts, :days, 10)
    tags = Keyword.get(opts, :tags, ["WR", "CR", "NR"])

    from_date = Date.utc_today() |> Date.add(-days)

    results =
      Repo.all(
        from result in Result,
          join: round in assoc(result, :round),
          join: competition_event in assoc(round, :competition_event),
          join: competition in assoc(competition_event, :competition),
          where:
            result.single_record_tag in ^tags or
              result.average_record_tag in ^tags,
          where: competition.start_date >= ^from_date,
          preload: [:person, round: {round, competition_event: competition_event}]
      )

    single_records =
      results
      |> Enum.filter(fn result -> result.single_record_tag in tags end)
      |> Enum.map(fn result ->
        %{
          result: result,
          type: "single",
          tag: result.single_record_tag,
          attempt_result: result.best
        }
      end)

    average_records =
      results
      |> Enum.filter(fn result -> result.average_record_tag in tags end)
      |> Enum.map(fn result ->
        %{
          result: result,
          type: "average",
          tag: result.average_record_tag,
          attempt_result: result.average
        }
      end)

    # Group by record key, then pick best in each group,
    # so that we show only one record of each type.
    (single_records ++ average_records)
    |> Enum.map(fn record ->
      person = record.result.person
      event_id = record.result.round.competition_event.event_id

      %{record_key: record_key} =
        tags_with_record_key(person, event_id, record.type)
        |> Enum.find(fn %{tag: tag} -> tag == record.tag end)

      Map.put(record, :id, record_key)
    end)
    |> Enum.group_by(& &1.id)
    |> Enum.flat_map(fn {_, records} ->
      # Note: if there is a tie, we want both records.
      min_attempt_result = records |> Enum.map(& &1.attempt_result) |> Enum.min()
      Enum.filter(records, &(&1.attempt_result == min_attempt_result))
    end)
    |> Enum.sort_by(fn record ->
      event_id = record.result.round.competition_event.event_id

      {record_tag_rank(record.tag), Event.get_rank_by_id!(event_id),
       record_type_rank(record.type), record.attempt_result}
    end)
  end

  defp record_tag_rank("WR"), do: 1
  defp record_tag_rank("CR"), do: 2
  defp record_tag_rank("NR"), do: 3

  defp record_type_rank("single"), do: 1
  defp record_type_rank("average"), do: 2

  def next_qualifying_to_round(round) do
    previous = get_previous_round(round) |> Repo.preload(results: :person)

    cond do
      previous == nil ->
        # Given a first round, so there is no *next* person who qualifies to it.
        []

      not Enum.any?(previous.results, & &1.advancing) ->
        # This is only possible if the given round has no results (not open yet)
        # and no one from the previous round satisfies the advancement condition.
        # In this case there is no one who could qualify.
        []

      true ->
        already_quit = already_quit_results(previous.results)

        first_advancing =
          previous.results |> Enum.filter(& &1.advancing) |> Enum.min_by(& &1.ranking)

        candidates_to_qualify =
          Enum.filter(previous.results, fn result ->
            not result.advancing and result not in already_quit
          end)

        # Take already quit results and the first advancing one,
        # then *pretend* they got the worst results and didn't qualify
        # (ended up at the very bottom of results).
        # This way we see who else would advance.
        ignored_results = [first_advancing | already_quit]
        hypothetically_qualifying = qualifying_results_ignoring(previous, ignored_results)

        hypothetically_qualifying
        |> Enum.filter(fn result -> result in candidates_to_qualify end)
        |> Enum.map(& &1.person)
    end
  end

  # Returns results that quit the next round by looking at the "gaps" in advancement.
  # Note: if the last advancing result quits then this approach doesn't detect it,
  # but it's still pretty much the best heuristic. We could compare qualifying and advancing results,
  # but this wouldn't work when many results quit.
  defp already_quit_results(results) do
    max_advancing_ranking =
      results
      |> Enum.filter(& &1.advancing)
      |> Enum.map(& &1.ranking)
      |> Enum.max()

    results
    # Should advance...
    |> Enum.filter(fn result -> result.ranking <= max_advancing_ranking end)
    # ...but didn't, because they quit the next round.
    |> Enum.filter(fn result -> not result.advancing end)
  end

  defp qualifying_results_ignoring(round, ignored_results) do
    # Empty attempts rank ignored people at the end (making sure they don't qualify).
    # Then recompute rankings and see who would qualify as a result.
    hypothetical_results =
      Enum.map(round.results, fn result ->
        if result in ignored_results do
          %{result | attempts: [], best: 0, average: 0}
        else
          result
        end
      end)

    hypothetical_round =
      compute_ranking(%{round | results: hypothetical_results}) |> Ecto.Changeset.apply_changes()

    qualifying_results(hypothetical_round)
    |> Enum.map(fn hypothetical_result ->
      Enum.find(round.results, &(&1.id == hypothetical_result.id))
    end)
  end

  def advancement_candidates(round) do
    round = round |> Repo.preload(:results)
    previous = get_previous_round(round) |> Repo.preload(results: :person)

    if previous == nil do
      # Anyone qualifies to the first round.

      people =
        round
        |> Ecto.assoc([:competition_event, :competition, :people])
        |> Repo.all()
        |> Repo.preload(:registration)

      qualifying =
        people
        |> Enum.filter(&Person.competitor?/1)
        |> Enum.reject(fn person ->
          Enum.any?(round.results, fn result -> result.person_id == person.id end)
        end)

      %{qualifying: qualifying, revocable: []}
    else
      already_quit = already_quit_results(previous.results)

      could_just_advance =
        qualifying_results_ignoring(previous, already_quit)
        |> Enum.reject(& &1.advancing)

      cond do
        not Enum.empty?(could_just_advance) ->
          qualifying = (already_quit ++ could_just_advance) |> Enum.map(& &1.person)
          %{qualifying: qualifying, revocable: []}

        not Enum.empty?(already_quit) ->
          # See who wouldn't qualify if we un-quit one person.
          new_qualifying = qualifying_results_ignoring(previous, Enum.drop(already_quit, 1))

          revocable =
            previous.results
            |> Enum.filter(& &1.advancing)
            |> Enum.filter(fn result -> result not in new_qualifying end)
            |> Enum.map(& &1.person)

          qualifying = already_quit |> Enum.map(& &1.person)
          %{qualifying: qualifying, revocable: revocable}

        true ->
          # Everyone qualifying is already in the round.
          %{qualifying: [], revocable: []}
      end
    end
  end

  def add_person_to_round(person, round) do
    round = round |> Repo.preload(:results)

    if Enum.any?(round.results, &(&1.person_id == person.id)) do
      {:error, "cannot add person as they are already in this round"}
    else
      %{qualifying: qualifying, revocable: revocable} = advancement_candidates(round)
      qualifies? = Enum.any?(qualifying, &(&1.id == person.id))

      if not qualifies? do
        {:error, "cannot add person as they don't qualify"}
      else
        new_result = empty_result_for_person_id(person.id)

        results =
          Enum.reject(round.results, fn result ->
            Enum.any?(revocable, fn person -> person.id == result.person_id end)
          end)

        [new_result | results]
        |> put_results_in_round(round)
        |> update_round_and_previous_advancing()
      end
    end
  end

  def remove_person_from_round(person, round, replace) do
    round = round |> Repo.preload(:results)

    result = Enum.find(round.results, &(&1.person_id == person.id))

    if result == nil do
      {:error, "cannot remove person as they are not in this round"}
    else
      substitutes = next_qualifying_to_round(round)

      new_results =
        if replace do
          substitutes
          |> Enum.map(& &1.id)
          |> Enum.map(&empty_result_for_person_id/1)
        else
          []
        end

      results = List.delete(round.results, result) ++ new_results

      results
      |> put_results_in_round(round)
      |> update_round_and_previous_advancing()
    end
  end
end
