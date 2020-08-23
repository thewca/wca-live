defmodule WcaLive.Wcif.UtilsTest do
  use ExUnit.Case, async: true

  alias WcaLive.Wcif.Utils

  # Partial WCIF for the tests below.
  @wcif_with_schedule %{
    "schedule" => %{
      "startDate" => "2020-04-10",
      "numberOfDays" => 2,
      "venues" => [
        %{
          "name" => "Venue 1",
          "rooms" => [
            %{
              "name" => "Room 1",
              "activities" => [
                %{
                  "name" => "Activity 1",
                  "startTime" => "2020-04-10T05:20:00Z",
                  "endTime" => "2020-04-10T06:00:00Z",
                  "childActivities" => []
                },
                %{
                  "name" => "Activity 2",
                  "startTime" => "2020-04-10T06:00:00Z",
                  "endTime" => "2020-04-10T06:10:00Z",
                  "childActivities" => []
                }
              ]
            }
          ]
        }
      ]
    }
  }

  @wcif_with_no_activities %{
    "schedule" => %{
      "startDate" => "2020-04-10",
      "numberOfDays" => 2,
      "venues" => []
    }
  }

  test "start_date/1 returns Date based on schedule" do
    assert ~D[2020-04-10] == Utils.start_date(@wcif_with_schedule)
  end

  test "end_date/1 returns Date based on schedule" do
    assert ~D[2020-04-12] == Utils.end_date(@wcif_with_schedule)
  end

  test "first_activity_start_time/1 returns DateTime based on schedule activities" do
    assert ~U[2020-04-10 05:20:00Z] == Utils.first_activity_start_time(@wcif_with_schedule)
  end

  test "first_activity_start_time/1 raises error when there are no activities in schedule" do
    assert_raise ArgumentError, fn ->
      Utils.first_activity_start_time(@wcif_with_no_activities)
    end
  end

  test "last_activity_end_time/1 returns DateTime based on schedule activities" do
    assert ~U[2020-04-10 06:10:00Z] == Utils.last_activity_end_time(@wcif_with_schedule)
  end

  test "last_activity_end_time/1 raises error when there are no activities in schedule" do
    assert_raise ArgumentError, fn -> Utils.last_activity_end_time(@wcif_with_no_activities) end
  end
end
