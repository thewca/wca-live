defmodule WcaLive.Scoretaking.AdvancingTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory
  import WcaLive.FactoryHelpers

  alias WcaLive.Scoretaking.Advancing

  test "compute_advancing/1 if the next round is open sets advancing based on which competitors are there" do
    competition_event = insert(:competition_event)

    round1 =
      insert(:round,
        competition_event: competition_event,
        number: 1,
        advancement_condition: %{type: "ranking", level: 3}
      )

    %{id: id1} = insert(:result, round: round1, ranking: 1, advancing: false)
    result2 = %{id: id2} = insert(:result, round: round1, ranking: 2, advancing: false)
    %{id: id3} = insert(:result, round: round1, ranking: 3, advancing: false)
    result4 = %{id: id4} = insert(:result, round: round1, ranking: 4, advancing: false)

    round2 =
      insert(:round, competition_event: competition_event, number: 2, advancement_condition: nil)

    # result2 and result4 actually made it to the next round
    insert(:result, round: round2, person: result2.person)
    insert(:result, round: round2, person: result4.person)

    changeset = Advancing.compute_advancing(round1)

    updated_results = apply_changes(changeset).results

    assert [
             %{id: ^id1, advancing: false},
             %{id: ^id2, advancing: true},
             %{id: ^id3, advancing: false},
             %{id: ^id4, advancing: true}
           ] = updated_results
  end

  # Note this is a basic test of compute_advancing/1,
  # all the edge cases related to qualifying are covered by
  # the tests of qualifying_results/1 below.
  test "compute_advancing/1 if the next round is not open sets advancing based on who qualifies to it" do
    competition_event = insert(:competition_event)

    round1 =
      insert(:round,
        competition_event: competition_event,
        number: 1,
        advancement_condition: %{type: "ranking", level: 3}
      )

    %{id: id1} = insert(:result, round: round1, ranking: 1, advancing: false)
    %{id: id2} = insert(:result, round: round1, ranking: 2, advancing: false)
    %{id: id3} = insert(:result, round: round1, ranking: 3, advancing: false)
    %{id: id4} = insert(:result, round: round1, ranking: 4, advancing: false)

    _round2 =
      insert(:round, competition_event: competition_event, number: 2, advancement_condition: nil)

    changeset = Advancing.compute_advancing(round1)

    updated_results = apply_changes(changeset).results

    assert [
             %{id: ^id1, advancing: true},
             %{id: ^id2, advancing: true},
             %{id: ^id3, advancing: true},
             %{id: ^id4, advancing: false}
           ] = updated_results
  end

  test "compute_advancing/1 sets questionable advancing if the round has empty results" do
    competition_event = insert(:competition_event)

    round1 =
      insert(:round,
        competition_event: competition_event,
        number: 1,
        advancement_condition: %{type: "ranking", level: 3}
      )

    %{id: id1} =
      insert(:result, round: round1, ranking: 1, best: 1000, average: 1000, advancing: false)

    %{id: id2} =
      insert(:result, round: round1, ranking: 2, best: 1100, average: 1100, advancing: false)

    %{id: id3} =
      insert(:result, round: round1, ranking: 3, best: 1200, average: 1200, advancing: false)

    %{id: id4} =
      insert(:result, round: round1, ranking: nil, best: 0, average: 0, advancing: false)

    _round2 =
      insert(:round, competition_event: competition_event, number: 2, advancement_condition: nil)

    changeset = Advancing.compute_advancing(round1)

    updated_results = apply_changes(changeset).results

    assert [
             %{id: ^id1, advancing: true},
             %{id: ^id2, advancing: true},
             %{id: ^id3, advancing: true},
             %{id: ^id4, advancing: false}
           ] = updated_results

    assert [
             %{id: ^id1, advancing_questionable: false},
             %{id: ^id2, advancing_questionable: false},
             %{id: ^id3, advancing_questionable: true},
             %{id: ^id4, advancing_questionable: false}
           ] = updated_results
  end

  test "qualifying_results/1 returns an empty list if the round has no results" do
    round = insert(:round, number: 1)

    assert [] == Advancing.qualifying_results(round)
  end

  test "qualifying_results/1 given `ranking` advancement condition, returns results with ranking better or equal to the given one" do
    round = insert(:round, number: 1, advancement_condition: %{type: "ranking", level: 3})
    result1 = insert(:result, round: round, ranking: 1)
    result2 = insert(:result, round: round, ranking: 2)
    result3 = insert(:result, round: round, ranking: 3)
    _result4 = insert(:result, round: round, ranking: 4)
    _result5 = insert(:result, round: round, ranking: 5)

    assert ids([result1, result2, result3]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 given `percent` advancement condition, rounds the number of advancing people down" do
    round = insert(:round, number: 1, advancement_condition: %{type: "percent", level: 50})
    result1 = insert(:result, round: round, ranking: 1)
    result2 = insert(:result, round: round, ranking: 2)
    _result3 = insert(:result, round: round, ranking: 3)
    _result4 = insert(:result, round: round, ranking: 4)
    _result5 = insert(:result, round: round, ranking: 5)

    assert ids([result1, result2]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 given `attemptResult` advancement condition and format sorting by best, returns results with best strictly better than the specified value" do
    round =
      insert(:round,
        number: 1,
        advancement_condition: %{type: "attemptResult", level: 1200},
        format_id: "3"
      )

    result1 = insert(:result, round: round, ranking: 1, best: 1000)
    result2 = insert(:result, round: round, ranking: 2, best: 1100)
    _result3 = insert(:result, round: round, ranking: 3, best: 1200)
    _result4 = insert(:result, round: round, ranking: 4, best: 1300)
    _result5 = insert(:result, round: round, ranking: 5, best: 1400)

    assert ids([result1, result2]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 given `attemptResult` advancement condition and format sorting by average, returns results with average strictly better than the specified value" do
    round =
      insert(:round,
        number: 1,
        advancement_condition: %{type: "attemptResult", level: 1200},
        format_id: "a"
      )

    result1 = insert(:result, round: round, ranking: 1, average: 1000)
    result2 = insert(:result, round: round, ranking: 2, average: 1100)
    _result3 = insert(:result, round: round, ranking: 3, average: 1200)
    _result4 = insert(:result, round: round, ranking: 4, average: 1300)
    _result5 = insert(:result, round: round, ranking: 5, average: 1400)

    assert ids([result1, result2]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 if people with the same ranking don't fit in 75%, neither qualifies" do
    round = insert(:round, number: 1, advancement_condition: %{type: "ranking", level: 3})
    result1 = insert(:result, round: round, ranking: 1)
    result2 = insert(:result, round: round, ranking: 2)
    _result3 = insert(:result, round: round, ranking: 3)
    _result4 = insert(:result, round: round, ranking: 3)
    _result5 = insert(:result, round: round, ranking: 5)

    assert ids([result1, result2]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 does not return more than 75% even if more satisfy advancement condition" do
    round = insert(:round, number: 1, advancement_condition: %{type: "ranking", level: 4})
    result1 = insert(:result, round: round, ranking: 1)
    result2 = insert(:result, round: round, ranking: 2)
    result3 = insert(:result, round: round, ranking: 3)
    _result4 = insert(:result, round: round, ranking: 4)
    _result5 = insert(:result, round: round, ranking: 5)

    assert ids([result1, result2, result3]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 does not qualify incomplete results" do
    round = insert(:round, number: 1, advancement_condition: %{type: "ranking", level: 3})
    result1 = insert(:result, round: round, ranking: 1)

    _result2 =
      insert(:result, round: round, ranking: 2, best: -1, average: -1, attempts: [%{result: -1}])

    _result3 = insert(:result, round: round, ranking: nil)
    _result4 = insert(:result, round: round, ranking: nil)
    _result5 = insert(:result, round: round, ranking: nil)

    assert ids([result1]) == ids(Advancing.qualifying_results(round))
  end

  test "qualifying_results/1 does not treat DNF results as satisfying `attemptResult` advancement condition" do
    round =
      insert(:round, number: 1, advancement_condition: %{type: "attemptResult", level: 1500})

    result1 = insert(:result, round: round, ranking: 1, best: 2000)
    _result2 = insert(:result, round: round, ranking: 2, best: -1)
    _result3 = insert(:result, round: round, ranking: nil)
    _result4 = insert(:result, round: round, ranking: nil)

    assert ids([result1]) == ids(Advancing.qualifying_results(round))
  end

  describe "qualifying_results/1 when the round has no advancement condition" do
    test "returns results with top 3 ranking" do
      round = insert(:round, number: 1, advancement_condition: nil)
      result1 = insert(:result, round: round, ranking: 1)
      result2 = insert(:result, round: round, ranking: 2)
      result3 = insert(:result, round: round, ranking: 3)
      _result4 = insert(:result, round: round, ranking: 4)
      _result5 = insert(:result, round: round, ranking: 5)

      assert ids([result1, result2, result3]) == ids(Advancing.qualifying_results(round))
    end

    test "returns more than 3 people if there are ties" do
      round = insert(:round, number: 1, advancement_condition: nil)
      result1 = insert(:result, round: round, ranking: 1)
      result2 = insert(:result, round: round, ranking: 2)
      result3 = insert(:result, round: round, ranking: 3)
      result4 = insert(:result, round: round, ranking: 3)
      _result5 = insert(:result, round: round, ranking: 5)

      assert ids([result1, result2, result3, result4]) == ids(Advancing.qualifying_results(round))
    end

    test "does not return people without any successful attempt" do
      round = insert(:round, number: 1, advancement_condition: nil)
      result1 = insert(:result, round: round, ranking: 1)
      result2 = insert(:result, round: round, ranking: 2)
      _result3 = insert(:result, round: round, ranking: 3, best: -1)

      assert ids([result1, result2]) == ids(Advancing.qualifying_results(round))
    end
  end

  test "next_qualifying_to_round/1 given the first round returns an empty list" do
    competition_event = insert(:competition_event)
    insert_list(2, :registration, competition_events: [competition_event])
    round = insert(:round, number: 1, competition_event: competition_event)

    assert [] == Advancing.next_qualifying_to_round(round)
  end

  test "next_qualifying_to_round/1 returns an empty list if no one satisfies the advancement criteria" do
    competition_event = insert(:competition_event)

    round1 = insert(:round, number: 1, competition_event: competition_event)
    round2 = insert(:round, number: 2, competition_event: competition_event)

    insert_list(8, :result,
      round: round1,
      ranking: 1,
      attempts: [build(:attempt, result: -1)],
      best: -1,
      average: -1,
      advancing: false
    )

    assert [] == Advancing.next_qualifying_to_round(round2)
  end

  test "next_qualifying_to_round/1 returns the person who could qualify next" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        first_round_advancing_ranks: [1, 2, 3, 4],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 4)
      )

    [expected] = setup.get_people_by_rank.(5)

    assert [next_qualifying_person] = Advancing.next_qualifying_to_round(setup.second_round)
    assert expected.id == next_qualifying_person.id
  end

  test "next_qualifying_to_round/1 returns multiple people if all could qualify" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 5, 7, 8],
        first_round_advancing_ranks: [1, 2, 3, 4],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 4)
      )

    tied_people = setup.get_people_by_rank.(5)

    next_qualifying_people = Advancing.next_qualifying_to_round(setup.second_round)
    assert ids(tied_people) == ids(next_qualifying_people)
  end

  test "next_qualifying_to_round/1 returns an empty array if there are too many people to fit in advancing 75%" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 7],
        first_round_advancing_ranks: [1, 2, 3, 4, 5, 6],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 6)
      )

    assert [] == Advancing.next_qualifying_to_round(setup.second_round)
  end

  test "next_qualifying_to_round/1 ignores people who already quit the given round" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        first_round_advancing_ranks: [1, 2, 3, 5],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 4)
      )

    [next_nonadvancing_person] = setup.get_people_by_rank.(6)

    assert [next_qualifying_person] = Advancing.next_qualifying_to_round(setup.second_round)
    assert next_nonadvancing_person.id == next_qualifying_person.id
  end

  test "advancement_candidates/1 given the first round qualifies any accepted competitor who is not in the given round" do
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition)
    round = insert(:round, number: 1, competition_event: competition_event)
    insert_list(2, :result, round: round)

    accepted_person = insert(:person, competition: competition)
    insert(:registration, person: accepted_person, status: "accepted")

    pending_person = insert(:person, competition: competition)
    insert(:registration, person: pending_person, status: "pending")

    %{qualifying: qualifying, revocable: revocable} = Advancing.advancement_candidates(round)
    assert accepted_person.id in ids(qualifying)
    assert pending_person.id not in ids(qualifying)
    assert [] == revocable
  end

  test "advancement_candidates/1 returns empty arrays if no one else qualifies" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        first_round_advancing_ranks: [1, 2, 3, 4, 5, 6],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 6)
      )

    %{qualifying: qualifying, revocable: revocable} =
      Advancing.advancement_candidates(setup.second_round)

    assert [] == qualifying
    assert [] == revocable
  end

  test "advancement_candidates/1 returns only qualifying people if there is a free spot" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        # 5th person quit.
        first_round_advancing_ranks: [1, 2, 3, 4, 6],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 6)
      )

    [person_5th] = setup.get_people_by_rank.(5)
    [person_7th] = setup.get_people_by_rank.(7)

    %{qualifying: qualifying, revocable: revocable} =
      Advancing.advancement_candidates(setup.second_round)

    assert ids([person_5th, person_7th]) == ids(qualifying)
    assert [] == revocable
  end

  test "advancement_candidates/1 returns revocable people if someone qualifies but there is no free spot" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        # 5th person quit and 7th hopped in.
        # So 5th person qualifies, but then 7th would need to be revoked.
        first_round_advancing_ranks: [1, 2, 3, 4, 6, 7],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 6)
      )

    [person_5th] = setup.get_people_by_rank.(5)
    [person_7th] = setup.get_people_by_rank.(7)

    %{qualifying: qualifying, revocable: revocable} =
      Advancing.advancement_candidates(setup.second_round)

    assert ids([person_5th]) == ids(qualifying)
    assert ids([person_7th]) == ids(revocable)
  end

  test "advancement_candidates/1 does not treat tied competitors as qualifying if there is a spot for just one" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 7],
        # 5th person quit, so there's one free spot.
        first_round_advancing_ranks: [1, 2, 3, 4, 6],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 6)
      )

    [person_5th] = setup.get_people_by_rank.(5)

    %{qualifying: qualifying, revocable: revocable} =
      Advancing.advancement_candidates(setup.second_round)

    # Only the 5th person that quit qualifies.
    assert ids([person_5th]) == ids(qualifying)
    assert [] == revocable
  end

  defp ids(list) do
    list |> Enum.map(& &1.id) |> Enum.sort()
  end
end
