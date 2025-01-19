defmodule WcaLive.Scoretaking do
  @moduledoc """
  Context for scoretaking.

  This is the core logic and has mostly
  to do with round and result management.
  """

  import Ecto.Query, warn: false

  alias Ecto.{Changeset, Multi}
  alias WcaLive.Repo
  alias WcaLive.Wca.{Event, Format}
  alias WcaLive.Competitions.{Person, Registration, Competition}
  alias WcaLive.Scoretaking.{Round, Result, Ranking, Advancing, RecordTags}
  alias WcaLive.Accounts.User

  @doc """
  Gets a single round.
  """
  @spec get_round(term()) :: %Round{} | nil
  def get_round(id), do: Repo.get(Round, id)

  @doc """
  Gets a single round.

  Raises an error if no round is found.
  """
  @spec get_round!(term(), list()) :: %Round{}
  def get_round!(id, preloads \\ []) do
    Repo.get!(Round, id) |> Repo.preload(preloads)
  end

  @doc """
  Finds round by id.

  Raises an error if no round is found.
  """
  @spec fetch_round(term()) :: {:ok, %Round{}} | {:error, Ecto.Queryable.t()}
  def fetch_round(id), do: Repo.fetch(Round, id)

  @doc """
  Finds round given event id and number.
  """
  @spec get_round_by_event_and_number!(term(), String.t(), pos_integer()) :: %Round{}
  def get_round_by_event_and_number!(competition_id, event_id, round_number) do
    Repo.one!(
      from round in Round,
        join: competition_event in assoc(round, :competition_event),
        where:
          competition_event.competition_id == ^competition_id and round.number == ^round_number and
            competition_event.event_id == ^event_id
    )
  end

  @doc """
  Returns `round` with results loaded.
  """
  @spec preload_results(%Round{}) :: %Round{}
  def preload_results(round), do: Repo.preload(round, :results)

  @doc """
  Returns `round` with results and persons loaded.
  """
  @spec preload_results_with_person(%Round{}) :: %Round{}
  def preload_results_with_person(round), do: Repo.preload(round, results: :person)

  @doc """
  Finds previous round, unless the first round is given.
  """
  @spec get_previous_round(%Round{}) :: %Round{} | nil
  def get_previous_round(round) do
    Round
    |> Round.where_sibling(round, -1)
    |> Repo.one()
  end

  @doc """
  Finds next round, unless the last round is given.
  """
  @spec get_next_round(%Round{}) :: %Round{} | nil
  def get_next_round(round) do
    Round
    |> Round.where_sibling(round, +1)
    |> Repo.one()
  end

  @doc """
  Gets a single result.

  Raises an error if no round is found.
  """
  @spec get_result!(term()) :: %Result{}
  def get_result!(id), do: Repo.get!(Result, id)

  @doc """
  Gets a single result.
  """
  @spec fetch_result(term()) :: {:ok, %Result{}} | {:error, Ecto.Queryable.t()}
  def fetch_result(id), do: Repo.fetch(Result, id)

  @doc """
  Finds round given event id and number.
  """
  @spec get_result_by_registrant_id!(term(), pos_integer()) :: %Result{}
  def get_result_by_registrant_id!(round_id, registrant_id) do
    Repo.one!(
      from round in Round,
        join: result in assoc(round, :results),
        join: person in assoc(result, :person),
        where: round.id == ^round_id and person.registrant_id == ^registrant_id,
        select: result
    )
  end

  @doc """
  Updates attempts for a batch of results.

  Stores the timestamp and user who entered the attempts. Also updates
  ranking, records and advancing based on the new state.
  """
  @spec enter_results(
          %Round{},
          list(%{id: term(), attempts: list(map()), entered_at: DateTime.t()}),
          %User{}
        ) :: {:ok, %Round{}} | {:error, Ecto.Changeset.t()}
  def enter_results(round, results_attrs, user) do
    round = Repo.preload(round, [:competition_event, :results])

    format = Format.get_by_id!(round.format_id)
    event_id = round.competition_event.event_id
    time_limit = round.time_limit
    cutoff = round.cutoff

    results_with_attrs =
      for attrs <- results_attrs,
          result = Enum.find(round.results, &(&1.id == attrs.id)),
          do: {result, attrs.attempts, attrs.entered_at}

    results_multi =
      Enum.reduce(results_with_attrs, Multi.new(), fn {result, attempts, entered_at}, multi ->
        Multi.update(multi, {:updated_result, result.id}, fn _changes ->
          result
          |> Result.changeset(%{attempts: attempts}, event_id, format, time_limit, cutoff)
          |> Changeset.put_change(:entered_by_id, user.id)
          |> Changeset.put_change(:entered_at, DateTime.truncate(entered_at, :second))
        end)
      end)

    results_multi
    |> Multi.merge(fn _ ->
      round = Repo.preload(round, :results, force: true)
      process_round_after_results_change(round)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, _} -> {:ok, get_round!(round.id)}
      {:error, _, reason, _} -> {:error, reason}
    end
  end

  @doc """
  Updates a single attempt of the given result.

  Wraps `enter_results/3`.
  """
  def enter_result_attempt(round, result, attempt_number, attempt_result, user) do
    format = Format.get_by_id!(round.format_id)

    attempt_attrs = Enum.map(result.attempts, &Map.from_struct/1)

    padded_attempt_attrs =
      attempt_attrs ++
        List.duplicate(%{result: 0}, format.number_of_attempts - length(result.attempts))

    padded_attempt_attrs =
      put_in(padded_attempt_attrs, [Access.at!(attempt_number - 1), :result], attempt_result)

    attempt_attrs =
      padded_attempt_attrs
      |> Enum.reverse()
      |> Enum.drop_while(&(&1.result == 0))
      |> Enum.reverse()

    results_attrs = [
      %{
        id: result.id,
        attempts: attempt_attrs,
        entered_at: DateTime.utc_now()
      }
    ]

    enter_results(round, results_attrs, user)
  end

  # Updates attributes (`ranking`, `advancing` and record tags) of the given round results.
  @spec process_round_after_results_change(%Round{}) :: Ecto.Multi.t()
  defp process_round_after_results_change(round) do
    Multi.new()
    |> Multi.update(:compute_ranking, fn _ ->
      Ranking.compute_ranking(round)
    end)
    |> Multi.update(:compute_advancing, fn %{compute_ranking: round} ->
      # Note: advancement usually depends on ranking, that's why we compute it first.
      Advancing.compute_advancing(round)
    end)
    |> Multi.update(:compute_record_tags, fn %{compute_advancing: round} ->
      competition_event = round |> Ecto.assoc(:competition_event) |> Repo.one!()
      RecordTags.compute_record_tags(competition_event)
    end)
  end

  @doc """
  Creates empty results for all competitors that qualify to `round`.

  In case of first round anyone who registered is added.
  For subsequent rounds, empty results from the previous round
  are removed first, then people qualify based on the advancement condition.
  """
  @spec open_round(%Round{}) :: {:ok, %Round{}} | {:error, String.t() | Ecto.Changeset.t()}
  def open_round(round) do
    round = round |> Repo.preload(:results)

    if Round.open?(round) do
      {:error, "cannot open this round as it is already open"}
    else
      message = validate_previous_rounds(round)
      if message do
        {:error, message}
      else
        Multi.new()
        |> Multi.run(:finish_previous, fn _repo, _changes ->
          if round.number > 1 do
            previous = get_previous_round(round) |> Repo.preload(:results)
            finish_round(previous)
          else
            {:ok, nil}
          end
        end)
        |> Multi.run(:create_results, fn _repo, _changes ->
          create_empty_results(round)
        end)
        |> Repo.transaction()
        |> case do
          {:ok, %{create_results: round}} -> {:ok, round}
          {:error, _, reason, _} -> {:error, reason}
        end
      end
    end
  end

  # Check that enough people have competed in the previous round in order to open the next round
  # See https://www.worldcubeassociation.org/regulations/#9m
  defp validate_previous_rounds(round) do
    min = [8, 16, 100]
    round_results =
      Enum.to_list(1..round.number - 1 // 1)
      |> Enum.map(
        fn round_offset ->
          Round |> Round.where_sibling(round, -round_offset) |> Repo.one() |> Repo.preload(:results)
        end
      )
      |> Enum.map(fn round -> round.results |> Enum.reject(&Result.empty?/1) |> length() end)

    Enum.find_index(Enum.zip(round_results, min), fn {x, y} -> x < y end)
    |> case do
      0 -> "Rounds with 7 or fewer competitors must not have subsequent rounds"
      1 -> "Rounds with 15 or fewer competitors must have at most one subsequent round"
      2 -> "Rounds with 99 or fewer competitors must have at most two subsequent rounds"
      _ -> :nil
    end
  end

  # Finishes `round` by removing empty results, so that the next round may be opened.
  defp finish_round(round) do
    # Note: we remove empty results, so we need to recompute advancing results,
    # because an advancement condition may depend on the total number of results (i.e. "percent" type).

    Enum.reject(round.results, &Result.empty?/1)
    |> Round.put_results_in_round(round)
    |> update_round_and_advancing()
  end

  defp create_empty_results(round) do
    empty_results =
      person_ids_for_round(round)
      |> Enum.map(&Result.empty_result(person_id: &1))

    if empty_results == [] do
      {:error,
       "cannot open this round as no one #{if round.number == 1, do: "registered", else: "qualified"}"}
    else
      empty_results
      |> Round.put_results_in_round(round)
      |> Repo.update()
    end
  end

  defp person_ids_for_round(round) do
    if round.number == 1 do
      registrations =
        round
        |> Ecto.assoc([:competition_event, :registrations])
        |> Repo.all()

      registrations
      |> Enum.filter(&Registration.accepted?/1)
      |> Enum.map(& &1.person_id)
    else
      previous = round |> get_previous_round() |> Repo.preload(:results)

      previous.results
      |> Enum.filter(& &1.advancing)
      |> Enum.map(& &1.person_id)
    end
  end

  @doc """
  Removes all results in `round`.
  """
  @spec clear_round(%Round{}) :: {:ok, %Round{}} | {:error, String.t() | Ecto.Changeset.t()}
  def clear_round(round) do
    round = round |> Repo.preload(:results)
    next = get_next_round(round) |> Repo.preload(:results)

    if next && Round.open?(next) do
      {:error, "cannot clear this round as the next one is already open"}
    else
      []
      |> Round.put_results_in_round(round)
      |> update_round_and_advancing()
    end
  end

  @doc """
  Creates an empty result for `person` in `round` as long as they qualify.

  If someone no longer qualifies as a result, they get removed.
  """
  @spec add_person_to_round(%Person{}, %Round{}) ::
          {:ok, %Round{}} | {:error, String.t() | Ecto.Changeset.t()}
  def add_person_to_round(person, round) do
    round = round |> Repo.preload(:results)

    if Enum.any?(round.results, &(&1.person_id == person.id)) do
      {:error, "cannot add person as they are already in this round"}
    else
      %{qualifying: qualifying, revocable: revocable} = Advancing.advancement_candidates(round)
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
        |> update_round_and_advancing()
      end
    end
  end

  @doc """
  Removes `person` from `round` (by removing their result).

  ## Options

    * `:replace` - Add the next qualifying person to this round if applicable. Defaults to `false`.
  """
  @spec remove_person_from_round(%Person{}, %Round{}, keyword()) ::
          {:ok, %Round{}} | {:error, String.t() | Ecto.Changeset.t()}
  def remove_person_from_round(person, round, opts \\ []) do
    replace = Keyword.get(opts, :replace, false)

    round = round |> Repo.preload(:results)

    result = Enum.find(round.results, &(&1.person_id == person.id))

    if result == nil do
      {:error, "cannot remove person as they are not in this round"}
    else
      substitutes = Advancing.next_qualifying_to_round(round)

      new_results =
        if replace do
          Enum.map(substitutes, &Result.empty_result(person: &1))
        else
          []
        end

      results = List.delete(round.results, result) ++ new_results

      results
      |> Round.put_results_in_round(round)
      |> update_round_and_advancing()
    end
  end

  @doc """
  Removes results from `round` corresponding to the given `person_ids`,
  provided they have no attempts.
  """
  @spec remove_no_shows_from_round(%Round{}, list(pos_integer())) ::
          {:ok, %Round{}} | {:error, String.t() | Ecto.Changeset.t()}
  def remove_no_shows_from_round(round, person_ids) do
    round = round |> Repo.preload(:results)

    results = Enum.reject(round.results, &(&1.person_id in person_ids and &1.attempts == []))

    results
    |> Round.put_results_in_round(round)
    |> update_round_and_advancing()
  end

  # Saves the given round changeset and recomputes `advancing` for
  # results in this and the previous round.

  # Certain changes to round results (specifically removing/adding a person)
  # affect the `advancing` flag on previous round result and this function
  # takes care of updating that. Also, change in the number of competitors
  # impact advancement in the given round, if a percentage advancement
  # condition is used.
  @spec update_round_and_advancing(Ecto.Changeset.t(%Round{})) ::
          {:ok, %Round{}} | {:error, any()}
  defp update_round_and_advancing(round_changeset) do
    Multi.new()
    |> Multi.update(:round, round_changeset)
    |> Multi.update(:compute_advancing, fn %{round: round} ->
      Advancing.compute_advancing(round)
    end)
    |> Multi.run(:compute_previous_advancing, fn _, %{compute_advancing: round} ->
      previous = get_previous_round(round) |> Repo.preload(:results)

      if previous == nil do
        {:ok, nil}
      else
        previous |> Advancing.compute_advancing() |> Repo.update()
      end
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{compute_advancing: round}} -> {:ok, round}
      {:error, _, reason, _} -> {:error, reason}
    end
  end

  @type record :: %{
          id: String.t(),
          result: %Result{},
          type: :single | :average,
          tag: String.t(),
          attempt_result: integer()
        }

  @doc """
  Returns a list of records done recently.

  If record of a given type has been broken several times,
  only the best result is included in the list.

  ## Options

    * `:days` - The number of past days to limit records to.
      Competition start date is used, so that all records
      from the same competitions disappear at the same time. Defaults to `10`.
    * `:tags` - The record tags to limit records to. Defaults to `["WR", "CR", "NR"]`.
  """
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

    group_records(results, tags)
  end

  @doc """
  Returns a list of records for the given competition.
  """
  @spec list_competition_records(%Competition{}) :: list(record())
  def list_competition_records(competition) do
    competition_id = competition.id
    tags = ["WR", "CR", "NR"]

    results =
      Repo.all(
        from result in Result,
          join: round in assoc(result, :round),
          join: competition_event in assoc(round, :competition_event),
          where:
            result.single_record_tag in ^tags or
              result.average_record_tag in ^tags,
          where: competition_event.competition_id == ^competition_id,
          preload: [:person, round: {round, competition_event: competition_event}]
      )

    group_records(results, tags)
  end

  defp group_records(results, tags) do
    single_records =
      results
      |> Enum.filter(fn result -> result.single_record_tag in tags end)
      |> Enum.map(fn result ->
        %{
          id: "#{result.id}-single",
          result: result,
          type: :single,
          tag: result.single_record_tag,
          attempt_result: result.best
        }
      end)

    average_records =
      results
      |> Enum.filter(fn result -> result.average_record_tag in tags end)
      |> Enum.map(fn result ->
        %{
          id: "#{result.id}-average",
          result: result,
          type: :average,
          tag: result.average_record_tag,
          attempt_result: result.average
        }
      end)

    # Group by record key, then pick best in each group,
    # so that we show only one record of each type.
    (single_records ++ average_records)
    |> Enum.group_by(fn record ->
      person = record.result.person
      event_id = record.result.round.competition_event.event_id

      %{record_key: record_key} =
        RecordTags.tags_with_record_key(person, event_id, record.type)
        |> Enum.find(fn %{tag: tag} -> tag == record.tag end)

      record_key
    end)
    |> Enum.flat_map(fn {_, records} ->
      # Note: if there is a tie, we want both records.
      min_attempt_result = records |> Enum.map(& &1.attempt_result) |> Enum.min()
      Enum.filter(records, &(&1.attempt_result == min_attempt_result))
    end)
    |> Enum.sort_by(fn record ->
      event_id = record.result.round.competition_event.event_id
      person_name = record.result.person.name

      {record_tag_rank(record.tag), Event.get_rank_by_id!(event_id),
       record_type_rank(record.type), record.attempt_result, person_name}
    end)
  end

  defp record_tag_rank("WR"), do: 1
  defp record_tag_rank("CR"), do: 2
  defp record_tag_rank("NR"), do: 3

  defp record_type_rank(:single), do: 1
  defp record_type_rank(:average), do: 2

  @type podium :: %{
          round: %Round{},
          results: list(%Result{})
        }

  @doc """
  Returns a list of podium objects for the given competition,
  one for each event.

  Each podium object corresponds to a final round of an event
  and holds a list of results with top 3 ranking from this round.
  If a final round is not finished or not even open,
  there's still a podium object representing it,
  but the result list is empty.
  """
  @spec list_podiums(%Competition{}) :: list(podium())
  def list_podiums(competition) do
    competition_events =
      competition
      |> Ecto.assoc(:competition_events)
      |> Repo.all()
      |> Repo.preload(rounds: :results)

    competition_events
    |> Enum.sort_by(&Event.get_rank_by_id!(&1.event_id))
    |> Enum.map(fn competition_event ->
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
