defmodule WcaLive.ScoretakingTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory
  import WcaLive.FactoryHelpers

  alias WcaLive.Scoretaking
  alias WcaLive.Repo

  test "get_round/1 returns round with the given id" do
    round = insert(:round)

    assert round.id == Scoretaking.get_round(round.id).id
  end

  test "get_round!/1 returns round with the given id" do
    round = insert(:round)

    assert round.id == Scoretaking.get_round!(round.id).id
  end

  test "get_round!/1 raises an error if no round is found" do
    assert_raise Ecto.NoResultsError, fn -> Scoretaking.get_round!(1) end
  end

  test "fetch_round/1 returns round with the given id in a tuple" do
    round = insert(:round)

    assert {:ok, found} = Scoretaking.fetch_round(round.id)
    assert round.id == found.id
  end

  test "get_round_by_event_and_number!/3 returns round if there is a matching one" do
    round = insert(:round)

    assert found =
             Scoretaking.get_round_by_event_and_number!(
               round.competition_event.competition_id,
               round.competition_event.event_id,
               round.number
             )

    assert round.id == found.id
  end

  test "get_round_by_event_and_number!/3 raises an error if no round is found" do
    assert_raise Ecto.NoResultsError, fn ->
      Scoretaking.get_round_by_event_and_number!(1, "333", 0)
    end
  end

  test "preload_results/1 returns round with results loaded" do
    round = insert(:round)
    insert_list(2, :result, round: round)

    round = Scoretaking.preload_results(round)
    assert 2 == length(round.results)
  end

  test "get_previous_round!/1 returns previous round" do
    competition_event = insert(:competition_event)
    first_round = insert(:round, number: 1, competition_event: competition_event)
    second_round = insert(:round, number: 2, competition_event: competition_event)

    assert first_round.id == Scoretaking.get_previous_round(second_round).id
  end

  test "get_previous_round!/1 returns nil if the first round is given" do
    competition_event = insert(:competition_event)
    first_round = insert(:round, number: 1, competition_event: competition_event)

    assert nil == Scoretaking.get_previous_round(first_round)
  end

  test "get_next_round!/1 returns next round" do
    competition_event = insert(:competition_event)
    first_round = insert(:round, number: 1, competition_event: competition_event)
    second_round = insert(:round, number: 2, competition_event: competition_event)

    assert second_round.id == Scoretaking.get_next_round(first_round).id
  end

  test "get_next_round!/1 returns nil if the last round is given" do
    competition_event = insert(:competition_event)
    first_round = insert(:round, number: 1, competition_event: competition_event)

    assert nil == Scoretaking.get_next_round(first_round)
  end

  test "get_result!/1 returns result with the given id" do
    result = insert(:result)

    assert result.id == Scoretaking.get_result!(result.id).id
  end

  test "get_result!/1 raises an error if no result is found" do
    assert_raise Ecto.NoResultsError, fn -> Scoretaking.get_result!(1) end
  end

  test "fetch_result/1 returns result with the given id in a tuple" do
    result = insert(:result)

    assert {:ok, found} = Scoretaking.fetch_result(result.id)
    assert result.id == found.id
  end

  test "enter_results/3 updates result attempts and who entered them" do
    user = insert(:user)
    round = insert(:round)
    result = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))

    attrs = [
      %{
        id: result.id,
        attempts: [
          %{result: 900},
          %{result: 800},
          %{result: 1000},
          %{result: 600},
          %{result: 700}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert user.id == result.entered_by_id
    assert [900, 800, 1000, 600, 700] == Enum.map(result.attempts, & &1.result)
  end

  test "enter_results/3 computes best and average" do
    user = insert(:user)
    round = insert(:round, format_id: "a")
    result = insert(:result, round: round, best: 0, average: 0)

    attrs = [
      %{
        id: result.id,
        attempts: [
          %{result: 900},
          %{result: 800},
          %{result: 1000},
          %{result: 600},
          %{result: 700}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert 600 == result.best
    assert 800 == result.average
  end

  test "enter_results/3 assigns skipped value to average if not applicable" do
    user = insert(:user)
    round = insert(:round, format_id: "1")
    result = insert(:result, round: round, best: 0, average: 0)

    attrs = [%{id: result.id, attempts: [%{result: 900}], entered_at: DateTime.utc_now()}]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert 900 == result.best
    assert 0 == result.average
  end

  test "enter_results/3 updates ranking and advancing" do
    user = insert(:user)
    round = insert(:round, format_id: "1", advancement_condition: %{type: "percent", level: 50})

    _result1 =
      insert(:result,
        round: round,
        attempts: [%{result: 1000}],
        best: 1000,
        average: 0,
        ranking: 1,
        advancing: true
      )

    result2 = insert(:result, round: round, ranking: nil, attempts: [], advancing: false)

    attrs = [%{id: result2.id, attempts: [%{result: 900}], entered_at: DateTime.utc_now()}]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result2 = Repo.reload(result2)
    assert 1 == result2.ranking
    assert true == result2.advancing
  end

  test "enter_results/3 assigns record tags" do
    user = insert(:user)

    person = insert(:person, country_iso2: "GB")
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 1500)
    insert(:personal_best, person: person, event_id: "333", type: "average", best: 2000)

    round = insert(:round)

    result =
      insert(:result,
        round: round,
        person: person,
        single_record_tag: nil,
        average_record_tag: nil
      )

    attrs = [
      %{
        id: result.id,
        attempts: [
          %{result: 1400},
          %{result: 2500},
          %{result: 2500},
          %{result: 2500},
          %{result: 2500}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert "PR" == result.single_record_tag
    assert nil == result.average_record_tag
  end

  test "enter_results/3 returns an error if all attempts are DNS" do
    user = insert(:user)
    round = insert(:round, cutoff: nil, format_id: "a")
    result = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))

    attrs = [
      %{
        id: result.id,
        attempts: [%{result: -2}, %{result: -2}, %{result: -2}, %{result: -2}, %{result: -2}],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:error, changeset} = Scoretaking.enter_results(round, attrs, user)

    assert "can't all be DNS, remove the competitor from this round instead" in errors_on(
             changeset
           ).attempts
  end

  test "enter_results/3 does not return an error if some attempts are DNS but remaining are skipped" do
    user = insert(:user)
    round = insert(:round, cutoff: nil, format_id: "a")
    result = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))

    attrs = [
      %{
        id: result.id,
        attempts: [%{result: -2}, %{result: -2}, %{result: -2}],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _updated} = Scoretaking.enter_results(round, attrs, user)
  end

  test "enter_results/3 returns an error if all cutoff attempts are DNS" do
    user = insert(:user)

    round =
      insert(:round,
        cutoff: build(:cutoff, number_of_attempts: 2, attempt_result: 1000),
        format_id: "a"
      )

    result = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))

    attrs = [
      %{id: result.id, attempts: [%{result: -2}, %{result: -2}], entered_at: DateTime.utc_now()}
    ]

    assert {:error, changeset} = Scoretaking.enter_results(round, attrs, user)

    assert "can't all be DNS, remove the competitor from this round instead" in errors_on(
             changeset
           ).attempts
  end

  test "enter_results/3 works with multiple results" do
    user = insert(:user)
    round = insert(:round)
    result1 = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))
    result2 = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))

    attrs = [
      %{
        id: result1.id,
        attempts: [
          %{result: 900},
          %{result: 800},
          %{result: 1000},
          %{result: 600},
          %{result: 700}
        ],
        entered_at: DateTime.utc_now()
      },
      %{
        id: result2.id,
        attempts: [
          %{result: 901},
          %{result: 801},
          %{result: 1001},
          %{result: 601},
          %{result: 701}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result1 = Repo.reload(result1)
    assert user.id == result1.entered_by_id
    assert [900, 800, 1000, 600, 700] == Enum.map(result1.attempts, & &1.result)
    result2 = Repo.reload(result2)
    assert user.id == result2.entered_by_id
    assert [901, 801, 1001, 601, 701] == Enum.map(result2.attempts, & &1.result)
  end

  test "enter_results/3 ignores nonexistent results" do
    user = insert(:user)
    round = insert(:round)

    attrs = [%{id: 111_111_111, attempts: [], entered_at: DateTime.utc_now()}]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
  end

  test "enter_results/3 applies non-cumulative time limit" do
    user = insert(:user)

    round =
      insert(:round,
        time_limit: build(:time_limit, centiseconds: 1250, cumulative_round_wcif_ids: [])
      )

    result = insert(:result, round: round, attempts: [])

    attrs = [
      %{
        id: result.id,
        attempts: [
          %{result: 1000},
          %{result: 1250},
          %{result: 1100},
          %{result: 1300}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert [1000, -1, 1100, -1] == Enum.map(result.attempts, & &1.result)
  end

  test "enter_results/3 applies single-round cumulative time limit" do
    user = insert(:user)

    competition = insert(:competition)
    ce333bf = insert(:competition_event, competition: competition, event_id: "333bf")

    round =
      insert(:round,
        competition_event: ce333bf,
        time_limit: build(:time_limit, centiseconds: 20000, cumulative_round_wcif_ids: ["333bf"])
      )

    result = insert(:result, round: round, attempts: [])

    attrs = [
      %{
        id: result.id,
        attempts: [
          %{result: 3000},
          %{result: 12000},
          %{result: 5000}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert [3000, 12000, -1] == Enum.map(result.attempts, & &1.result)
  end

  test "enter_results/3 applies cutoff" do
    user = insert(:user)

    round =
      insert(:round,
        cutoff: build(:cutoff, number_of_attempts: 2, attempt_result: 800),
        format_id: "a"
      )

    result = insert(:result, round: round, attempts: [])

    attrs = [
      %{
        id: result.id,
        attempts: [
          %{result: 1000},
          %{result: 800},
          %{result: 1200}
        ],
        entered_at: DateTime.utc_now()
      }
    ]

    assert {:ok, _round} = Scoretaking.enter_results(round, attrs, user)
    result = Repo.reload(result)
    assert [1000, 800] == Enum.map(result.attempts, & &1.result)
  end

  test "enter_result_attempt/5 adds skipped attempts when necessary" do
    user = insert(:user)
    round = insert(:round, cutoff: nil, format_id: "a")
    result = insert(:result, round: round, attempts: [])

    assert {:ok, _round} = Scoretaking.enter_result_attempt(round, result, 2, 1000, user)
    result = Repo.reload(result)
    assert [0, 1000] == Enum.map(result.attempts, & &1.result)
  end

  test "enter_result_attempt/5 trims skipped attempts" do
    user = insert(:user)
    round = insert(:round, cutoff: nil, format_id: "a")
    result = insert(:result, round: round, attempts: build_list(3, :attempt, result: 1000))

    assert {:ok, _round} = Scoretaking.enter_result_attempt(round, result, 3, 0, user)
    result = Repo.reload(result)
    assert [1000, 1000] == Enum.map(result.attempts, & &1.result)
  end

  test "open_round/1 given the first round adds everyone who registered for the event" do
    competition = insert(:competition)
    ce333 = insert(:competition_event, competition: competition, event_id: "333")
    insert_list(2, :registration, competition_events: [ce333])
    insert(:registration, competition_events: [ce333], status: "pending")
    ce444 = insert(:competition_event, competition: competition, event_id: "444")
    insert_list(2, :registration, competition_events: [ce444])

    round333 = insert(:round, number: 1, competition_event: ce333)

    assert {:ok, _updated} = Scoretaking.open_round(round333)
    results = round333 |> Ecto.assoc(:results) |> Repo.all()
    assert 2 == length(results)
  end

  test "open_round/1 given a subsequent round removes empty results from previous round and adds advancing competitors" do
    competition_event = insert(:competition_event)

    round1 =
      insert(:round,
        number: 1,
        competition_event: competition_event,
        advancement_condition: build(:advancement_condition, type: "percent", level: 50)
      )

    round2 = insert(:round, number: 2, competition_event: competition_event)

    for ranking <- 1..8, do: insert(:result, round: round1, ranking: ranking)
    insert_list(4, :result, round: round1, ranking: nil, attempts: [])

    assert {:ok, _updated} = Scoretaking.open_round(round2)
    results1 = round1 |> Ecto.assoc(:results) |> Repo.all()
    results2 = round2 |> Ecto.assoc(:results) |> Repo.all()
    assert 8 == length(results1)
    assert 4 == length(results2)
  end

  test "open_round/1 updates advancing for competitors removed from the previous round" do
    competition_event = insert(:competition_event)

    round1 =
      insert(:round,
        number: 1,
        competition_event: competition_event,
        advancement_condition: build(:advancement_condition, type: "ranking", level: 10)
      )

    round2 =
      insert(:round,
        number: 2,
        competition_event: competition_event,
        advancement_condition: build(:advancement_condition, type: "ranking", level: 4)
      )

    round3 = insert(:round, number: 3, competition_event: competition_event)

    # In round 1, the first 10 competitors are advancing

    round1_results = for ranking <- 1..16, do: insert(:result, round: round1, ranking: ranking)

    [round1_first_result | round1_advancing_results] = Enum.take(round1_results, 10)

    assert round1_first_result.advancing

    # In round 2, the first person does not compete

    insert(:result, round: round2, person: round1_first_result.person, ranking: nil, attempts: [])

    for {%{person: person}, ranking} <- Enum.with_index(round1_advancing_results, 1) do
      insert(:result, round: round2, person: person, ranking: ranking)
    end

    # Opening round 3 removes the first person from round 2, so it
    # should also mark it as non-advancing in round 1

    assert {:ok, _updated} = Scoretaking.open_round(round3)
    round1_first_result = Repo.reload(round1_first_result)
    refute round1_first_result.advancing
  end

  test "open_round/1 returns an error if the previous round has less than 8 competitors as per #9m3" do
    competition_event = insert(:competition_event)

    round1 = insert(:round, number: 1, competition_event: competition_event)
    round2 = insert(:round, number: 2, competition_event: competition_event)

    for ranking <- 1..7, do: insert(:result, round: round1, ranking: ranking)

    assert {:error, "rounds with less than 8 competitors cannot have a subsequent round"} ==
             Scoretaking.open_round(round2)
  end

  test "open_round/1 returns an error if the round is already open" do
    competition_event = insert(:competition_event)

    round = insert(:round, number: 1, competition_event: competition_event)

    insert_list(2, :result, round: round)

    assert {:error, "cannot open this round as it is already open"} ==
             Scoretaking.open_round(round)
  end

  test "open_round/1 returns an error if noone qualifies to the given round" do
    competition_event = insert(:competition_event)

    round1 = insert(:round, number: 1, competition_event: competition_event)
    round2 = insert(:round, number: 2, competition_event: competition_event)

    insert_list(8, :result,
      round: round1,
      ranking: 1,
      attempts: [build(:attempt, result: -1)],
      best: -1,
      average: -1
    )

    assert {:error, "cannot open this round as no one qualified"} ==
             Scoretaking.open_round(round2)
  end

  test "clear_round/1 removes all results of the given round" do
    round = insert(:round)
    insert_list(4, :result, round: round)

    assert {:ok, updated} = Scoretaking.clear_round(round)
    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert [] == results
  end

  test "clear_round/1 returns an error if the next round is open" do
    competition_event = insert(:competition_event)

    round1 = insert(:round, number: 1, competition_event: competition_event)
    insert_list(2, :result, round: round1)
    round2 = insert(:round, number: 2, competition_event: competition_event)
    insert_list(2, :result, round: round2)

    assert {:error, "cannot clear this round as the next one is already open"} ==
             Scoretaking.clear_round(round1)
  end

  test "add_person_to_round/2 returns an error if the person is already in the given round" do
    person = insert(:person)
    round = insert(:round)
    insert(:result, round: round, person: person)

    assert {:error, "cannot add person as they are already in this round"} =
             Scoretaking.add_person_to_round(person, round)
  end

  test "add_person_to_round/2 returns an error if the person doesn't qualify to the given round" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        first_round_advancing_ranks: [1, 2, 3, 4],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 4)
      )

    [non_qualifying] = setup.get_people_by_rank.(5)

    assert {:error, "cannot add person as they don't qualify"} ==
             Scoretaking.add_person_to_round(non_qualifying, setup.second_round)
  end

  test "add_person_to_round/2 creates an empty result if the person qualifies" do
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition)
    round = insert(:round, number: 1, competition_event: competition_event)

    person = insert(:person, competition: competition)
    insert(:registration, person: person, status: "accepted")

    assert {:ok, updated} = Scoretaking.add_person_to_round(person, round)
    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert Enum.any?(results, &(&1.person_id == person.id))
  end

  test "add_person_to_round/2 removes people who no longer qualify" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        # 4th person quit and 5th hopped in.
        first_round_advancing_ranks: [1, 2, 3, 5],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 4)
      )

    [quit_person] = setup.get_people_by_rank.(4)
    [revocable_person] = setup.get_people_by_rank.(5)

    # Add the quit person back.
    assert {:ok, updated} = Scoretaking.add_person_to_round(quit_person, setup.second_round)
    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert Enum.any?(results, &(&1.person_id == quit_person.id))
    assert not Enum.any?(results, &(&1.person_id == revocable_person.id))
  end

  test "remove_person_from_round/3 removes person's result from the given round" do
    round = insert(:round, number: 1)
    insert_list(4, :result, round: round)
    person = insert(:person)
    insert(:result, person: person, round: round)

    assert {:ok, updated} = Scoretaking.remove_person_from_round(person, round)
    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert 4 == length(results)
    assert not Enum.any?(results, &(&1.person_id == person.id))
  end

  test "remove_person_from_round/3 given :replace adds the next qualifying person to the round" do
    setup =
      setup_rounds(
        first_round_ranks: [1, 2, 3, 4, 5, 6, 7, 8],
        first_round_advancing_ranks: [1, 2, 3, 4],
        first_round_advancement_condition:
          build(:advancement_condition, type: "ranking", level: 4)
      )

    [second_person] = setup.get_people_by_rank.(2)
    [next_qualifying_person] = setup.get_people_by_rank.(5)

    assert {:ok, updated} =
             Scoretaking.remove_person_from_round(second_person, setup.second_round,
               replace: true
             )

    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert Enum.any?(results, &(&1.person_id == next_qualifying_person.id))
    assert not Enum.any?(results, &(&1.person_id == second_person.id))
  end

  test "remove_person_from_round/3 updates advancing" do
    round =
      insert(:round,
        number: 1,
        advancement_condition: build(:advancement_condition, type: "percent", level: 50)
      )

    for ranking <- 1..5, do: insert(:result, round: round, ranking: ranking, advancing: true)
    for ranking <- 6..8, do: insert(:result, round: round, ranking: ranking, advancing: false)

    # With 9 people in the round, 5 should advance, once we remove
    # the missing result, only 4 should
    missing_result = insert(:result, round: round, ranking: nil, attempts: [], advancing: false)

    assert {:ok, updated} = Scoretaking.remove_person_from_round(missing_result.person, round)

    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert 4 == Enum.count(results, & &1.advancing)
  end

  test "removes_no_shows_from_round/2 removes no-show result with matching ids from the given round" do
    round = insert(:round, number: 1)
    insert_list(4, :result, round: round)

    person1 = insert(:person)
    insert(:result, person: person1, round: round)

    person2 = insert(:person)
    insert(:result, person: person2, round: round, attempts: [])

    assert {:ok, updated} =
             Scoretaking.remove_no_shows_from_round(round, [person1.id, person2.id])

    results = updated |> Ecto.assoc(:results) |> Repo.all()
    assert 5 == length(results)
    assert Enum.any?(results, &(&1.person_id == person1.id))
    assert not Enum.any?(results, &(&1.person_id == person2.id))
  end

  test "list_recent_records/1 ignores old records" do
    insert_result_x_days_ago(
      20,
      single_record_tag: "WR",
      average_record_tag: "CR",
      best: 300,
      average: 550
    )

    assert [] == Scoretaking.list_recent_records()
  end

  test "list_recent_records/1 if a result beats both single and average record, it's returned twice" do
    result =
      insert_result_x_days_ago(
        5,
        single_record_tag: "WR",
        average_record_tag: "CR",
        best: 300,
        average: 550
      )

    [single_wr, average_cr] = Scoretaking.list_recent_records()

    assert result.id == single_wr.result.id
    assert :single = single_wr.type
    assert "WR" = single_wr.tag
    assert 300 = single_wr.attempt_result

    assert result.id == average_cr.result.id
    assert :average = average_cr.type
    assert "CR" = average_cr.tag
    assert 550 = average_cr.attempt_result
  end

  test "list_recent_records/1 returns best record if there are many records of the same type" do
    insert_result_x_days_ago(
      5,
      single_record_tag: nil,
      average_record_tag: "NR",
      best: 300,
      average: 550,
      person: build(:person, country_iso2: "GB")
    )

    result2 =
      insert_result_x_days_ago(
        5,
        single_record_tag: nil,
        average_record_tag: "NR",
        best: 300,
        average: 500,
        person: build(:person, country_iso2: "GB")
      )

    [average_nr] = Scoretaking.list_recent_records()

    assert result2.id == average_nr.result.id
    assert :average = average_nr.type
    assert "NR" = average_nr.tag
    assert 500 = average_nr.attempt_result
  end

  test "list_recent_records/1 returns many records of the same type if they have the same attempt result" do
    insert_result_x_days_ago(
      5,
      single_record_tag: nil,
      average_record_tag: "NR",
      best: 300,
      average: 550,
      person: build(:person, country_iso2: "GB")
    )

    insert_result_x_days_ago(
      5,
      single_record_tag: nil,
      average_record_tag: "NR",
      best: 300,
      average: 550,
      person: build(:person, country_iso2: "GB")
    )

    records = Scoretaking.list_recent_records()

    assert 2 = length(records)
    assert 2 = records |> Enum.uniq_by(& &1.id) |> length()
  end

  test "list_competition_records/1 returns records from the given competition" do
    competition = insert(:competition)
    another_competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition)
    another_competition_event = insert(:competition_event, competition: another_competition)
    round = insert(:round, competition_event: competition_event)
    another_round = insert(:round, competition_event: another_competition_event)
    record = insert(:result, round: round, best: 300, average: 550, single_record_tag: "WR")
    insert(:result, round: another_round, best: 300, average: 550, average_record_tag: "WR")

    competition_records = Scoretaking.list_competition_records(competition)
    assert 1 = length(competition_records)
    assert record.id == Enum.at(competition_records, 0).result.id
  end

  test "list_podiums/1 returns one podium object for each final round" do
    competition = insert(:competition)
    ce333 = insert(:competition_event, competition: competition, event_id: "333")
    _round1_333 = insert(:round, competition_event: ce333, number: 1)
    round2_333 = insert(:round, competition_event: ce333, number: 2)
    ce444 = insert(:competition_event, competition: competition, event_id: "444")
    round1_444 = insert(:round, competition_event: ce444, number: 1)

    podiums = Scoretaking.list_podiums(competition)
    assert 2 = length(podiums)
    assert Enum.any?(podiums, &(&1.round.id == round2_333.id))
    assert Enum.any?(podiums, &(&1.round.id == round1_444.id))
    assert Enum.all?(podiums, &(&1.results == []))
  end

  test "list_podiums/1 includes results with top 3 ranking if there are any" do
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition)
    round = insert(:round, competition_event: competition_event, number: 1)

    results =
      Enum.map([1, 2, 3, 3, 5, 6], fn ranking ->
        insert(:result,
          round: round,
          ranking: ranking,
          best: 1000 + ranking,
          average: 1000 + ranking
        )
      end)

    [podium] = Scoretaking.list_podiums(competition)
    assert ids(Enum.take(results, 4)) == ids(podium.results)
  end

  test "list_podiums/1 does not include results with all unsuccessful attempts" do
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition)
    round = insert(:round, competition_event: competition_event, number: 1)

    winning_result = insert(:result, round: round, ranking: 1, best: 1000, average: 1000)
    _unsuccessful_result = insert(:result, round: round, ranking: 2, best: -1, average: -1)

    [podium] = Scoretaking.list_podiums(competition)
    assert [podium_result] = podium.results
    assert winning_result.id == podium_result.id
  end

  defp insert_result_x_days_ago(days, attrs) do
    x_days_ago = Date.utc_today() |> Date.add(-days)

    competition = insert(:competition, start_date: x_days_ago, end_date: x_days_ago)
    competition_event = insert(:competition_event, competition: competition)
    round = insert(:round, competition_event: competition_event)
    insert(:result, [{:round, round} | attrs])
  end

  defp ids(list) do
    list |> Enum.map(& &1.id) |> Enum.sort()
  end
end
