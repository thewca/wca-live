defmodule WcaLive.Scoretaking.RoundTest do
  use ExUnit.Case, async: true
  import WcaLive.Factory

  alias WcaLive.Scoretaking.Round

  test "label/1 returns best regional record tag if there is any result having one" do
    round =
      build(:round,
        results: [
          build(:result, average_record_tag: "NR"),
          build(:result),
          build(:result, average_record_tag: "CR")
        ]
      )

    assert "CR" == Round.label(round)
  end

  test "label/1 ignores PR record tags" do
    round =
      build(:round,
        results: [
          build(:result, average_record_tag: "PR"),
          build(:result, attempts: []),
          build(:result, attempts: [])
        ]
      )

    assert nil == Round.label(round)
  end

  test "open?/1 returns true if the round has any results" do
    closed_round = build(:round, results: [])
    open_round = build(:round, results: build_list(5, :result))

    assert not Round.open?(closed_round)
    assert Round.open?(open_round)
  end

  test "finished?/1 returns false if round has no results" do
    round = build(:round, results: [])

    assert false == Round.finished?(round)
  end

  test "finished?/1 returns true if all results are finished" do
    round = build(:round, results: build_list(5, :result, attempts: build_list(5, :attempt)))

    assert true == Round.finished?(round)
  end

  test "finished?/1 returns true if there are less than 10% empty results and the round is not active" do
    hour_ago = DateTime.utc_now() |> DateTime.add(-3600, :second)

    entered_results =
      build_list(50, :result, attempts: build_list(5, :attempt), entered_at: hour_ago)

    empty_results = build_list(2, :result, attempts: [])
    round = build(:round, results: entered_results ++ empty_results)

    assert true == Round.finished?(round)
  end

  test "active?/1 returns true if there are recently entered results" do
    recent_results =
      build_list(5, :result, attempts: build_list(5, :attempt), entered_at: DateTime.utc_now())

    empty_results = build_list(5, :result, attempts: [])
    round = build(:round, results: empty_results ++ recent_results)

    assert true == Round.active?(round)
  end

  test "active?/1 ignores recent empty results" do
    recent_empty = build_list(5, :result, attempts: [], entered_at: DateTime.utc_now())
    round = build(:round, results: recent_empty)

    assert false == Round.active?(round)
  end
end
