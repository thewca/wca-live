defmodule WcaLive.Scoretaking.ResultTest do
  use ExUnit.Case, async: true
  import WcaLive.Factory

  alias WcaLive.Scoretaking.Result

  test "meets_cutoff?/2 returns true if one of first phase attempt results beat cutoff" do
    result =
      build(:result,
        attempts: [
          build(:attempt, result: 1000),
          build(:attempt, result: 899)
        ]
      )

    cutoff = build(:cutoff, number_of_attempts: 2, attempt_result: 900)

    assert true == Result.meets_cutoff?(result, cutoff)
  end

  test "meets_cutoff?/2 returns false if none of first phase attempt results beat cutoff" do
    result =
      build(:result,
        attempts: [
          build(:attempt, result: 1000),
          build(:attempt, result: 900),
          build(:attempt, result: 899)
        ]
      )

    cutoff = build(:cutoff, number_of_attempts: 2, attempt_result: 900)

    assert false == Result.meets_cutoff?(result, cutoff)
  end

  test "has_expected_attempts?/2 checks if result has first phase attempts if it doesn't meet cutoff" do
    result =
      build(:result,
        attempts: [
          build(:attempt, result: 1000),
          build(:attempt, result: 900)
        ]
      )

    cutoff = build(:cutoff, number_of_attempts: 2, attempt_result: 900)

    assert true == Result.has_expected_attempts?(result, 5, cutoff)
  end

  test "has_expected_attempts?/2 checks if result has all attempts if it meets cutoff" do
    result1 =
      build(:result,
        attempts: [
          build(:attempt, result: 1000),
          build(:attempt, result: 899)
        ]
      )

    result2 =
      build(:result,
        attempts: [
          build(:attempt, result: 1000),
          build(:attempt, result: 899),
          build(:attempt),
          build(:attempt),
          build(:attempt)
        ]
      )

    cutoff = build(:cutoff, number_of_attempts: 2, attempt_result: 900)

    assert false == Result.has_expected_attempts?(result1, 5, cutoff)
    assert true == Result.has_expected_attempts?(result2, 5, cutoff)
  end
end
