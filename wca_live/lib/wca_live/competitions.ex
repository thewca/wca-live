defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Wcif
  alias WcaLive.Wca
  alias WcaLive.Accounts
  alias WcaLive.Accounts.User

  alias WcaLive.Competitions.{
    Competition,
    Round,
    Person,
    CompetitionBrief,
    Result,
    Format,
    AttemptResult,
    Country,
    AdvancementCondition
  }

  @doc """
  Returns the list of projects.
  """
  def list_competitions() do
    Repo.all(Competition)
  end

  @doc """
  Gets a single competition.
  """
  def get_competition(id), do: Repo.get(Competition, id)

  @doc """
  Gets a single competition.
  """
  def get_competition!(id), do: Repo.get!(Competition, id)

  @doc """
  Gets a single round.
  """
  def get_round(id), do: Repo.get(Round, id)

  @doc """
  Gets a single person.
  """
  def get_person(id), do: Repo.get(Person, id)

  def import_competition(wca_id, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.get_wcif(wca_id, access_token.access_token) do
      %Competition{}
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:imported_by, user)
      |> Wcif.Import.import_competition(wcif)
    end
  end

  def synchronize_competition(competition) do
    imported_by = competition |> Ecto.assoc(:imported_by) |> Repo.one!()

    with {:ok, access_token} <- Accounts.get_valid_access_token(imported_by),
         {:ok, wcif} <- Wca.Api.get_wcif(competition.wca_id, access_token.access_token) do
      Wcif.Import.import_competition(competition, wcif)
    end

    # TODO: save synchronized WCIF back to the WCA website (resutls part).
  end

  @spec get_importable_competition_briefs(%User{}) :: list(CompetitionBrief.t())
  def get_importable_competition_briefs(user) do
    user = user |> Repo.preload(:access_token)
    {:ok, data} = Wca.Api.get_upcoming_manageable_competitions(user.access_token.access_token)

    competition_briefs =
      data
      |> Enum.filter(fn data -> data["announced_at"] != nil end)
      |> Enum.map(&CompetitionBrief.from_wca_json/1)

    wca_ids = Enum.map(competition_briefs, & &1.wca_id)

    imported_wca_ids =
      Repo.all(from c in Competition, where: c.wca_id in ^wca_ids, select: c.wca_id)

    Enum.filter(competition_briefs, fn competition ->
      competition.wca_id not in imported_wca_ids
    end)
  end

  @doc """
  Gets a single result.
  """
  def get_result!(id), do: Repo.get!(Result, id)

  def update_result(result, attrs) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:result, fn repo, _changes ->
      result = repo.preload(result, round: [:competition_event])
      {:ok, result}
    end)
    |> Ecto.Multi.update(:updated_result, fn %{result: result} ->
      format = Format.get_by_id!(result.round.format_id)
      event_id = result.round.competition_event.event_id
      Result.changeset(result, attrs, event_id, format.number_of_attempts)
    end)
    |> Ecto.Multi.merge(fn %{updated_result: result} ->
      process_round_after_results_change(result.round)
    end)
    |> Ecto.Multi.run(:final_result, fn repo, _changes ->
      result = repo.get!(Result, result.id)
      {:ok, result}
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{final_result: result}} -> {:ok, result}
      # TODO: use original error to privde a better message.
      {:error, _, _, _} -> {:error, "result update failed"}
    end
  end

  defp process_round_after_results_change(round) do
    competition_event =
      round
      |> Ecto.assoc(:competition_event)
      |> Repo.one!()
      |> Repo.preload(rounds: [:competition_event, results: [person: [:personal_bests]]])

    round = Enum.find(competition_event.rounds, &(&1.id == round.id))

    ranking_changesets = compute_ranking(round)
    record_tags_changesets = compute_record_tags(competition_event, round.number)
    advancing_changesets = compute_advancing(round)

    # Group changesets for the same result and merge them into one.
    (ranking_changesets ++ record_tags_changesets ++ advancing_changesets)
    |> Enum.group_by(fn changeset -> changeset.data.id end)
    |> Map.values()
    |> Enum.map(fn changesets -> Enum.reduce(changesets, &Ecto.Changeset.merge/2) end)
    |> Enum.reduce(Ecto.Multi.new(), fn changeset, multi ->
      Ecto.Multi.update(multi, {:result, changeset.data.id}, changeset)
    end)
  end

  defp compute_ranking(round) do
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
      Ecto.Changeset.change(result, ranking: ranking)
    end)
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

  defp compute_record_tags(competition_event, changed_round_number) do
    rounds = competition_event.rounds
    event_id = competition_event.event_id

    regional_records = get_regional_records()

    personal_records =
      hd(rounds).results
      |> Enum.map(& &1.person)
      |> Enum.map(&person_records/1)
      |> Enum.reduce(%{}, &merge_records/2)

    records = merge_records(regional_records, personal_records)

    {previous_rounds, affected_rounds} =
      Enum.split_with(rounds, fn round ->
        round.number < changed_round_number
      end)

    records =
      previous_rounds
      |> Enum.map(&round_records/1)
      |> Enum.reduce(%{}, &merge_records/2)
      |> merge_records(records)

    affected_rounds
    |> Enum.reduce({records, []}, fn round, {records, changesets} ->
      records = round |> round_records() |> merge_records(records)

      round_changesets =
        Enum.map(round.results, fn result ->
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

          Ecto.Changeset.change(result,
            single_record_tag: single_record_tag,
            average_record_tag: average_record_tag
          )
        end)

      {records, round_changesets ++ changesets}
    end)
    |> case do
      {_, changesets} -> changesets
    end
  end

  # TODO: implement a service for that
  defp get_regional_records() do
    %{}
  end

  defp record_key(event_id, type, scope) do
    event_id <> "#" <> type <> "#" <> scope
  end

  defp tags_with_record_key(person, event_id, type) do
    country = Country.get_by_iso2!(person.country_iso2)

    [
      %{tag: "WR", record_key: record_key(event_id, type, "world")},
      %{tag: "CR", record_key: record_key(event_id, type, to_string(country.continent_name))},
      %{tag: "NR", record_key: record_key(event_id, type, to_string(country.iso2))},
      %{tag: "PB", record_key: record_key(event_id, type, "person:" <> to_string(person.id))}
    ]
  end

  defp person_records(person) do
    Map.new(person.personal_bests, fn %{event_id: event_id, type: type, best: best} ->
      {record_key(event_id, type, "person:" <> to_string(person.id)), best}
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

  # ---- Advancing

  """
  Wording note:

    - **advancing** - actually being in the next round (the "green" results)
    - **qualifying** - satisfying advancement criteria
  """

  defp compute_advancing(round) do
    advancing = advancing_results(round)

    Enum.map(round.results, fn result ->
      Ecto.Changeset.change(result, advancing: result in advancing)
    end)
  end

  @doc """
  Gets a single round.
  """
  def get_round!(id), do: Repo.get!(Round, id)

  # ------- Round opening --------

  def open_round(round) do
    round = round |> Repo.preload(:results)
    previous = get_previous_round(round) |> Repo.preload(:results)

    if Round.open?(round) do
      {:error, "cannot open this round as it is already open"}
    else
      Ecto.Multi.new()
      |> Ecto.Multi.run(:close_previous_round, fn _repo, _changes ->
        if previous do
          close_round(previous)
        else
          {:ok, nil}
        end
      end)
      |> Ecto.Multi.run(:create_results, fn _repo, _changes ->
        create_empty_results(round, previous)
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{create_results: round}} -> {:ok, round}
        {:error, _, reason, _} -> {:error, reason}
      end
    end
  end

  defp close_round(round) do
    actual_results = Enum.reject(round.results, &Result.empty?/1)

    # See: https://www.worldcubeassociation.org/regulations/#9m3
    if length(actual_results) < 8 do
      # TODO: quite weird message given the function name, also there's not really closing as any round with results is open!
      {:error, "cannot open this round as the previous one has less than 8 competitors"}
    else
      round
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:results, actual_results)
      |> Repo.update()
      # TODO: recompute advancing!
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
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:results, empty_results)
      |> Repo.update()
    end
  end

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
    |> Ecto.Changeset.put_change(:person_id, person_id)
  end

  defp accepted?(%Person{registration: %{status: "accepted"}}), do: true
  defp accepted?(_person), do: false

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

  # ------- Round closing --------

  def clear_round(round) do
    round = round |> Repo.preload(:results)
    next = get_next_round(round) |> Repo.preload(:results)

    if next && Round.open?(next) do
      {:error, "cannot clear this round as the next one is already open"}
    else
      round
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:results, [])
      |> Repo.update()
    end
  end
end
