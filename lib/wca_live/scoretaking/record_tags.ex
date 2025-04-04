defmodule WcaLive.Scoretaking.RecordTags do
  @moduledoc """
  Functions related to calculating results record tags.
  """

  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.Wca
  alias WcaLive.Competitions
  alias WcaLive.Scoretaking

  @doc """
  Calculates single and average record tags on all results
  in the given `competition_event` and returns a changeset including the changes.

  Updating result record tags may affect subsequent round record tags,
  so after changing a result it's best to compute the record tags
  for all rounds of the given evnet.
  """
  @spec compute_record_tags(%Competitions.CompetitionEvent{}) ::
          Ecto.Changeset.t(%Competitions.CompetitionEvent{})
  def compute_record_tags(competition_event) do
    competition_event =
      competition_event
      |> Repo.preload(rounds: [:competition_event, results: [person: [:personal_bests]]])

    rounds = Enum.sort_by(competition_event.rounds, & &1.number)
    event_id = competition_event.event_id

    regional_records = Wca.RecordsStore.get_regional_records_map()

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
              tags_with_record_key(result.person, event_id, :single)
              |> Enum.find_value(fn %{record_key: record_key, tag: tag} ->
                if result.best == records[record_key], do: tag, else: nil
              end)

            average_record_tag =
              tags_with_record_key(result.person, event_id, :average)
              |> Enum.find_value(fn %{record_key: record_key, tag: tag} ->
                if result.average == records[record_key], do: tag, else: nil
              end)

            Changeset.change(result,
              single_record_tag: single_record_tag,
              average_record_tag: average_record_tag
            )
          end)
          |> Scoretaking.Round.put_results_in_round(round)

        {round_changeset, records}
      end)

    competition_event
    |> Changeset.change()
    |> Changeset.put_assoc(:rounds, round_changesets)
  end

  @doc """
  Returns a list of record tags with the corresponding record identifiers
  specific to the given person (because they depend on person's country).
  """
  @spec tags_with_record_key(%Competitions.Person{}, String.t(), :single | :average) ::
          list(%{tag: String.t(), record_key: Wca.Records.record_key()})
  def tags_with_record_key(person, event_id, type) do
    country = Wca.Country.get_by_iso2!(person.country_iso2)

    [
      %{tag: "WR", record_key: Wca.Records.record_key(event_id, type, "world")},
      %{tag: "CR", record_key: Wca.Records.record_key(event_id, type, country.continent_name)},
      %{tag: "NR", record_key: Wca.Records.record_key(event_id, type, country.iso2)},
      %{
        tag: "PR",
        record_key: Wca.Records.record_key(event_id, type, person_record_scope(person))
      }
    ]
  end

  defp person_record_scope(person), do: "person:" <> to_string(person.id)

  defp person_records(person) do
    Map.new(person.personal_bests, fn %{event_id: event_id, type: type, best: best} ->
      {Wca.Records.record_key(event_id, String.to_atom(type), person_record_scope(person)), best}
    end)
  end

  defp round_records(round) do
    results = round.results
    event_id = round.competition_event.event_id

    single_records =
      results
      |> Enum.filter(fn result -> Scoretaking.AttemptResult.complete?(result.best) end)
      |> Enum.flat_map(fn result ->
        tags_with_record_key(result.person, event_id, :single)
        |> Enum.map(fn %{record_key: record_key} -> {record_key, result.best} end)
      end)
      |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))
      |> Map.new(fn {record_key, values} -> {record_key, Enum.min(values)} end)

    average_records =
      results
      |> Enum.filter(fn result -> Scoretaking.AttemptResult.complete?(result.average) end)
      |> Enum.flat_map(fn result ->
        tags_with_record_key(result.person, event_id, :average)
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
