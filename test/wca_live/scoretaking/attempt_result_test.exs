defmodule WcaLive.Scoretaking.AttemptResultTest do
  use ExUnit.Case, async: true

  alias WcaLive.Scoretaking.AttemptResult

  test "better?/2 strictly compares successful attempt results" do
    assert AttemptResult.better?(999, 1000)
    assert not AttemptResult.better?(1000, 1000)
  end

  test "better?/2 treats any incomplete attempt result as worse than a successful one" do
    assert not AttemptResult.better?(0, 1000)
    assert not AttemptResult.better?(-1, 1000)
    assert not AttemptResult.better?(-2, 1000)

    assert AttemptResult.better?(1000, -1)
  end

  test "better?/2 treats all incomplete attempt results as equal" do
    assert not AttemptResult.better?(-1, -2)
    assert not AttemptResult.better?(-1, -1)
    assert not AttemptResult.better?(-1, 0)
  end

  test "to_monotonic/1 properly orders attempt results" do
    attempt_results = [1000, -1, 900, -2, 0]

    assert [900, 1000, -1, -2, 0] == Enum.sort_by(attempt_results, &AttemptResult.to_monotonic/1)
  end

  test "pad_skipped/2 given enough attempt results are given returns the same list" do
    assert [1100, 1000, 900] == AttemptResult.pad_skipped([1100, 1000, 900], 3)
  end

  test "pad_skipped/2 given too few attempt results adds skipped attempt results" do
    assert [1100, 1000, 900, 0, 0] == AttemptResult.pad_skipped([1100, 1000, 900], 5)
  end

  test "pad_skipped/2 given too many attempt results removes the excessing ones" do
    assert [1100, 1000] == AttemptResult.pad_skipped([1100, 1000, 900], 2)
  end

  test "best/1 given all skipped attempt results returns skipped value" do
    assert 0 == AttemptResult.best([])
    assert 0 == AttemptResult.best([0, 0, 0])
    assert 0 == AttemptResult.best([0, 0, 0, 0, 0])
  end

  test "best/1 given only incomplete attempt results including DNF returns DNF" do
    assert -1 == AttemptResult.best([-1])
    assert -1 == AttemptResult.best([-1, -1, -2])
    assert -1 == AttemptResult.best([-1, -1, 0, 0, 0])
  end

  test "best/1 given only skipped and DNS attempt results returns DNS" do
    assert -2 == AttemptResult.best([-2])
    assert -2 == AttemptResult.best([-2, -2, -2])
    assert -2 == AttemptResult.best([-2, -2, 0, 0, 0])
  end

  test "best/1 given some successful attempt results returns the best one" do
    assert 1000 == AttemptResult.best([1000])
    assert 980 == AttemptResult.best([980, -1, -2])
    assert 890 == AttemptResult.best([1100, 1200, 980, 950, 890])
  end

  test "average/2 returns skipped value for 3x3x3 Multi-Blind" do
    assert 0 == AttemptResult.average([970_360_001, 970_360_001, 970_360_001], "333mbf")
  end

  test "average/2 returns skipped value if any attempt result is skipped" do
    assert 0 == AttemptResult.average([1000, 1100, 1300, 0, 1200], "333")
  end

  test "average/2 returns DNF if any unsuccessful attempt result is counting" do
    assert -1 == AttemptResult.average([980, -1, 1010], "333")
    assert -1 == AttemptResult.average([980, 900, -2], "333")
    assert -1 == AttemptResult.average([-1, 980, 890, -1, 910], "333")
    assert -1 == AttemptResult.average([-1, 980, -2, 890, 910], "333")
  end

  test "average/2 trims best and worst in case of 5 attempt results" do
    assert 800 == AttemptResult.average([900, 800, 700, 4000, 600], "333")
    assert 800 == AttemptResult.average([900, 800, 700, 1000, 300], "333")
    assert 600 == AttemptResult.average([-1, 600, 600, 600, 500], "333")
  end

  test "average/2 does not trim best and worst in case of 3 attempt results" do
    assert 600 == AttemptResult.average([400, 500, 900], "333")
  end

  test "average/2 truncates averages over 10 minutes to seconds" do
    assert 60000 == AttemptResult.average([60041, 60041, 60041], "333")
    assert 60100 == AttemptResult.average([60051, 60051, 60051], "333")
  end

  test "average/2 returns correct average for 3x3x3 Fewest Moves" do
    assert 2500 == AttemptResult.average([24, 25, 26], "333fm")
    assert 2433 == AttemptResult.average([24, 24, 25], "333fm")
  end

  test "format/2 correctly formats incomplete values" do
    assert "" == AttemptResult.format(0, "333")
    assert "DNF" == AttemptResult.format(-1, "333")
    assert "DNS" == AttemptResult.format(-2, "333")
  end

  test "format/2 strips leading zeros" do
    assert "1.50" == AttemptResult.format(150, "333")
    assert "1:00.00" == AttemptResult.format(60 * 100, "333")
    assert "1:00:00.15" == AttemptResult.format(60 * 60 * 100 + 15, "333")
  end

  test "format/2 given 3x3x3 Fewest Moves recognises single and average correctly" do
    assert "28" == AttemptResult.format(28, "333fm")
    assert "28.33" == AttemptResult.format(2833, "333fm")
  end

  test "format/2 given 3x3x3 Multi-Blind shows the number of solved/attempted cubes and time without centiseconds" do
    assert "11/13 58:00" == AttemptResult.format(900_348_002, "333mbf")
    assert "3/4 1:00:00" == AttemptResult.format(970_360_001, "333mbf")
  end
end
