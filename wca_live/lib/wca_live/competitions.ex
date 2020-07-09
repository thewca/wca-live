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
    Country
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
    Ecto.Multi.new()
    |> Ecto.Multi.run(:competition_event, fn repo, _changes ->
      competition_event =
        round
        |> Ecto.assoc(:competition_event)
        |> repo.one!()
        |> repo.preload(rounds: [:competition_event, results: [person: [:personal_bests]]])
      {:ok, competition_event}
    end)
    |> Ecto.Multi.merge(fn %{competition_event: competition_event} ->
      round = Enum.find(competition_event.rounds, &(&1.id == round.id))

      ranking_changesets = compute_ranking(round)
      record_tags_changesets = compute_record_tags(competition_event, round.number)

      # Group changesets for the same result and merge them into one.
      (ranking_changesets ++ record_tags_changesets)
      |> Enum.group_by(fn changeset -> changeset.data.id end)
      |> Map.values()
      |> Enum.map(fn changesets -> Enum.reduce(changesets, &Ecto.Changeset.merge/2) end)
      |> Enum.reduce(Ecto.Multi.new(), fn changeset, multi ->
        Ecto.Multi.update(multi, {:result, changeset.data.id}, changeset)
      end)
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
end
