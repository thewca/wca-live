defmodule WcaLive.Wcif.Utils do
  @moduledoc """
  Utilities for working with WCIF data (parsed JSON).
  """

  @type wcif :: map()

  @spec start_date(wcif()) :: Date.t()
  def start_date(wcif) do
    wcif["schedule"]["startDate"] |> Date.from_iso8601!()
  end

  @spec end_date(wcif()) :: Date.t()
  def end_date(wcif) do
    start_date(wcif) |> Date.add(wcif["schedule"]["numberOfDays"] - 1)
  end

  @spec first_activity_start_time(wcif()) :: DateTime.t()
  def first_activity_start_time(wcif) do
    activities = top_level_activities(wcif)

    if activities == [] do
      raise ArgumentError, message: "schedule has no activities"
    end

    activities
    |> Enum.map(&(DateTime.from_iso8601(&1["startTime"]) |> elem(1)))
    |> Enum.min(DateTime)
  end

  @spec last_activity_end_time(wcif()) :: DateTime.t()
  def last_activity_end_time(wcif) do
    activities = top_level_activities(wcif)

    if activities == [] do
      raise ArgumentError, message: "schedule has no activities"
    end

    activities
    |> Enum.map(&(DateTime.from_iso8601(&1["endTime"]) |> elem(1)))
    |> Enum.max(DateTime)
  end

  defp top_level_activities(wcif) do
    wcif["schedule"]["venues"]
    |> Enum.flat_map(& &1["rooms"])
    |> Enum.flat_map(& &1["activities"])
  end
end
