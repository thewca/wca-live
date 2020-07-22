defmodule WcaLive.Scoretaking do
  import Ecto.Query, warn: false
  alias Ecto.{Changeset, Multi}
  alias WcaLive.Repo
  alias WcaLive.Wca.{Event, Format}
  alias WcaLive.Competitions.{Person, Registration, Competition}
  alias WcaLive.Scoretaking.{Round, Result}
  alias WcaLive.Scoretaking.Computation

  @doc """
  Gets a single round.
  """
  def get_round(id), do: Repo.get(Round, id)

  @doc """
  Gets a single round.
  """
  def get_round!(id), do: Repo.get!(Round, id)

  @doc """
  Gets a single round.
  """
  def fetch_round(id), do: Repo.fetch(Round, id)

  def preload_results(round), do: Repo.preload(round, :results)

  def get_previous_round(round) do
    Round
    |> Round.where_sibling(round, -1)
    |> Repo.one()
  end

  def get_next_round(round) do
    Round
    |> Round.where_sibling(round, +1)
    |> Repo.one()
  end

  @doc """
  Gets a single result.
  """
  def get_result!(id), do: Repo.get!(Result, id)

  @doc """
  Gets a single result.
  """
  def fetch_result(id), do: Repo.fetch(Result, id)

  def enter_result_attempts(result, attempts, user) do
    result = Repo.preload(result, round: [:competition_event])

    Multi.new()
    |> Multi.update(:updated_result, fn _changes ->
      format = Format.get_by_id!(result.round.format_id)
      event_id = result.round.competition_event.event_id

      result
      |> Result.changeset(%{attempts: attempts}, event_id, format.number_of_attempts)
      |> Changeset.put_change(:entered_by_id, user.id)
      |> Changeset.put_change(:entered_at, DateTime.utc_now() |> DateTime.truncate(:second))
    end)
    |> Multi.merge(fn %{updated_result: result} ->
      Computation.process_round_after_results_change(result.round)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, _} -> {:ok, get_result!(result.id)}
      {:error, _, reason, _} -> {:error, reason}
    end
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
      |> Multi.update(:remove_empty, Round.put_results_in_round(actual_results, round))
      |> Multi.update(:recompute_advancing, fn %{remove_empty: round} ->
        Computation.Advancing.compute_advancing(round)
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
      |> Enum.map(&Result.empty_result(person_id: &1))

    if Enum.empty?(empty_results) do
      {:error,
       "cannot open this round as no one #{if previous, do: "qualified", else: "registered"}"}
    else
      empty_results
      |> Round.put_results_in_round(round)
      |> Repo.update()
    end
  end

  defp person_ids_for_round(round, previous) do
    if previous do
      previous.results
      |> Enum.filter(& &1.advancing)
      |> Enum.map(& &1.person_id)
    else
      registrations =
        round
        |> Ecto.assoc([:competition_event, :registrations])
        |> Repo.all()

      registrations
      |> Enum.filter(&Registration.accepted?/1)
      |> Enum.map(& &1.person_id)
    end
  end

  def clear_round(round) do
    round = round |> Repo.preload(:results)
    next = get_next_round(round) |> Repo.preload(:results)

    if next && Round.open?(next) do
      {:error, "cannot clear this round as the next one is already open"}
    else
      []
      |> Round.put_results_in_round(round)
      |> Computation.update_round_and_previous_advancing()
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
        new_result = Result.empty_result(person: person)

        results =
          Enum.reject(round.results, fn result ->
            Enum.any?(revocable, fn person -> person.id == result.person_id end)
          end)

        [new_result | results]
        |> Round.put_results_in_round(round)
        |> Computation.update_round_and_previous_advancing()
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
          Enum.map(substitutes, &Result.empty_result(person: &1))
        else
          []
        end

      results = List.delete(round.results, result) ++ new_results

      results
      |> Round.put_results_in_round(round)
      |> Computation.update_round_and_previous_advancing()
    end
  end

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
      %{round | results: hypothetical_results}
      |> Computation.Ranking.compute_ranking()
      |> Ecto.Changeset.apply_changes()

    Computation.Advancing.qualifying_results(hypothetical_round)
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
        Computation.RecordTags.tags_with_record_key(person, event_id, record.type)
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

  @type podium :: %{
    round: %Round{},
    results: list(%Result{})
  }

  @spec list_podiums(%Competition{}) :: list(podium())
  def list_podiums(competition) do
    competition_events =
      competition
      |> Ecto.assoc(:competition_events)
      |> Repo.all()
      |> Repo.preload(rounds: :results)

    Enum.map(competition_events, fn competition_event ->
      final_round = Enum.max_by(competition_event.rounds, & &1.number)
      podium_results =
        final_round.results
        |> Enum.filter(fn result ->
          result.best > 0 and result.ranking != nil and result.ranking <= 3
        end)
        |> Enum.sort_by(& &1.ranking)

      %{round: final_round, results: podium_results}
    end)
  end
end
