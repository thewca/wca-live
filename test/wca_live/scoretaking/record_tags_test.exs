defmodule WcaLive.Scoretaking.RecordTagsTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Scoretaking.RecordTags

  # Note: tests use a mock version of the WCA API.
  # See `WcaLive.Wca.Api.InMemory` for predefined records these tests rely on.

  test "compute_record_tags/1 assigns nil tags if no there is no record" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    result = insert(:result, round: round, person: person, best: 1000, average: 1100)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             result.id => %{single: nil, average: nil}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 assigns personal records correctly" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    result = insert(:result, round: round, person: person, best: 750, average: 850)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             result.id => %{single: "PR", average: "PR"}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 assigns national records correctly" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    result = insert(:result, round: round, person: person, best: 650, average: 750)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             result.id => %{single: "NR", average: "NR"}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 assigns continental records correctly" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    result = insert(:result, round: round, person: person, best: 550, average: 650)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             result.id => %{single: "CR", average: "CR"}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 assigns world records correctly" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    result = insert(:result, round: round, person: person, best: 450, average: 550)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             result.id => %{single: "WR", average: "WR"}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 assigns only one record of the given type in the given round" do
    person1 = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person1, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person1, event_id: "333", type: "average", best: 900)

    person2 = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person2, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person2, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    person1_result = insert(:result, round: round, person: person1, best: 480, average: 550)
    person2_result = insert(:result, round: round, person: person2, best: 450, average: 580)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             person1_result.id => %{single: "PR", average: "WR"},
             person2_result.id => %{single: "WR", average: "PR"}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 allows record of the same type in many rounds" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round1 = insert(:round, competition_event: competition_event, number: 1)
    round2 = insert(:round, competition_event: competition_event, number: 2)
    round1_result = insert(:result, round: round1, person: person, best: 480, average: 580)
    round2_result = insert(:result, round: round2, person: person, best: 450, average: 550)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             round1_result.id => %{single: "WR", average: "WR"},
             round2_result.id => %{single: "WR", average: "WR"}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 does not assign record tags if previous round has a better record" do
    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round1 = insert(:round, competition_event: competition_event, number: 1)
    round2 = insert(:round, competition_event: competition_event, number: 2)
    round1_result = insert(:result, round: round1, person: person, best: 450, average: 550)
    round2_result = insert(:result, round: round2, person: person, best: 480, average: 580)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             round1_result.id => %{single: "WR", average: "WR"},
             round2_result.id => %{single: nil, average: nil}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  test "compute_record_tags/1 if there is no record of the given type, any complete result is treated as a record" do
    # Note: there are no records for either USA and North America in the mock version.
    person = insert(:person, country_iso2: "US")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 900)

    competition_event = insert(:competition_event, event_id: "333")
    round = insert(:round, competition_event: competition_event)
    result = insert(:result, round: round, person: person, best: 750, average: -1)

    changeset = RecordTags.compute_record_tags(competition_event)

    assert %{
             result.id => %{single: "CR", average: nil}
           } == competition_event_changeset_to_record_tags_map(changeset)
  end

  defp competition_event_changeset_to_record_tags_map(changeset) do
    updated_competition_event = apply_changes(changeset)

    updated_competition_event.rounds
    |> Enum.flat_map(& &1.results)
    |> Map.new(fn result ->
      {result.id, %{single: result.single_record_tag, average: result.average_record_tag}}
    end)
  end
end
