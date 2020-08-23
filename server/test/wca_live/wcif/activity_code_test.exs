defmodule WcaLive.Wcif.ActivityCodeTest do
  use ExUnit.Case, async: true

  alias WcaLive.Wcif.ActivityCode

  test "parse!/1 parses full official activity code" do
    assert %ActivityCode.Official{
             event_id: "333",
             round_number: 1,
             group_name: "2",
             attempt_number: 1
           } == ActivityCode.parse!("333-r1-g2-a1")
  end

  test "parse!/1 parses partial official activity code" do
    assert %ActivityCode.Official{
             event_id: "333",
             round_number: 1,
             group_name: "2",
             attempt_number: nil
           } == ActivityCode.parse!("333-r1-g2")

    assert %ActivityCode.Official{
             event_id: "333",
             round_number: 1,
             group_name: nil,
             attempt_number: nil
           } == ActivityCode.parse!("333-r1")

    assert %ActivityCode.Official{
             event_id: "333",
             round_number: nil,
             group_name: nil,
             attempt_number: nil
           } == ActivityCode.parse!("333")

    assert %ActivityCode.Official{
             event_id: "333",
             round_number: 1,
             group_name: nil,
             attempt_number: 2
           } == ActivityCode.parse!("333-r1-a2")
  end

  test "parse!/1 parses other activity code" do
    assert %ActivityCode.Other{id: "lunch"} == ActivityCode.parse!("other-lunch")
  end

  test "parse!/1 raises error when the given code is neither official nor other" do
    assert_raise ArgumentError, fn -> ActivityCode.parse!("invalid-code") end
  end

  test "implements String.Chars.to_string/1 for official activity code" do
    assert "333-r1-g2-a1" ==
             to_string(%ActivityCode.Official{
               event_id: "333",
               round_number: 1,
               group_name: "2",
               attempt_number: 1
             })

    assert "333-r1" ==
             to_string(%ActivityCode.Official{
               event_id: "333",
               round_number: 1,
               group_name: nil,
               attempt_number: nil
             })
  end

  test "implements String.Chars.to_string/1 for other activity code" do
    assert "other-lunch" ==
             to_string(%ActivityCode.Other{id: "lunch"})
  end
end
