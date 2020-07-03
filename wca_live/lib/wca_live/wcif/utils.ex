defmodule WcaLive.Wcif.Utils do
  def start_date(wcif) do
    wcif["schedule"]["startDate"] |> Date.from_iso8601!()
  end

  def end_date(wcif) do
    start_date(wcif) |> Date.add(wcif["schedule"]["numberOfDays"])
  end

  def first_activity_start_time(wcif) do
    wcif
    |> top_level_activities()
    |> Enum.map(&(DateTime.from_iso8601(&1["startTime"]) |> elem(1)))
    |> Enum.min()
  end

  def last_activity_end_time(wcif) do
    wcif
    |> top_level_activities()
    |> Enum.map(&(DateTime.from_iso8601(&1["endTime"]) |> elem(1)))
    |> Enum.max()
  end

  defp top_level_activities(wcif) do
    wcif["schedule"]["venues"]
    |> Enum.flat_map(& &1["rooms"])
    |> Enum.flat_map(& &1["activities"])
  end
end
