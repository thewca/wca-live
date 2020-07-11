defmodule WcaLive.Scoretaking do
  import Ecto.Query, warn: false
  alias Ecto.{Changeset, Multi}
  alias WcaLive.Repo

  alias WcaLive.Competitions.Person
  alias WcaLive.Wca
  alias WcaLive.Wca.{Country, Format}
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
      {:ok, _} -> {:ok, Repo.get!(Result, result.id)}
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
      format = Format.get_by_id!(round.format_id)
      qualifying_results(round.results, round.advancement_condition, format)
    end
  end

  defp qualifying_results([], _advancement_condition, _format), do: []

  defp qualifying_results(results, nil = _advancement_condition, _format) do
    # Mark top 3 in the finals (unless DNFed).
    Enum.filter(results, fn result ->
      result.best > 0 and result.ranking != nil and result.ranking <= 3
    end)
  end

  defp qualifying_results(results, advancement_condition, format) do
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

      result_changesets = compute_advancing(%{round | results: actual_results})

      round
      |> Changeset.change()
      |> Changeset.put_assoc(:results, result_changesets)
      |> Repo.update()
    end
  end

  defp create_empty_results(round, previous) do
    event_id = Repo.preload(round, :competition_event).competition_event.event_id
    format = Format.get_by_id!(round.format_id)

    empty_results =
      person_ids_for_round(round, previous, event_id)
      |> Enum.map(&empty_result_for_person(&1, event_id, format))

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

  defp person_ids_for_round(round, previous, event_id) do
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
      |> Enum.filter(&accepted?/1)
      |> Enum.filter(fn person -> event_id in person.registration.event_ids end)
      |> Enum.map(& &1.id)
    end
  end

  def empty_result_for_person(person_id, event_id, format) do
    %Result{}
    |> Result.changeset(%{}, event_id, format.number_of_attempts)
    |> Changeset.put_change(:person_id, person_id)
  end

  defp accepted?(%Person{registration: %{status: "accepted"}}), do: true
  defp accepted?(_person), do: false

  def clear_round(round) do
    round = round |> Repo.preload(:results)
    next = get_next_round(round) |> Repo.preload(:results)

    if next && Round.open?(next) do
      {:error, "cannot clear this round as the next one is already open"}
    else
      round
      |> Changeset.change()
      |> Changeset.put_assoc(:results, [])
      |> Repo.update()
    end
  end
end
