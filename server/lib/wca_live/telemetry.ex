defmodule WcaLive.Telemetry do
  require Logger

  @slow_query_threshold_ms 800
  @slow_graphql_threshold_ms 1_000

  def attach do
    events = [
      [:wca_live, :repo, :query],
      [:absinthe, :execute, :operation, :stop]
    ]

    :ok = :telemetry.attach_many("wca-live-handler", events, &handle_event/4, %{})
  end

  defp handle_event([:wca_live, :repo, :query], measurements, metadata, _config) do
    query_time_ms = System.convert_time_unit(measurements.query_time, :native, :millisecond)

    if query_time_ms > @slow_query_threshold_ms do
      Logger.info([
        "SLOW QUERY ",
        Integer.to_string(query_time_ms),
        "ms",
        ?\n,
        metadata.query,
        ?\s,
        inspect(metadata.params, charlists: false)
      ])
    end
  end

  defp handle_event([:absinthe, :execute, :operation, :stop], measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    if duration_ms > @slow_graphql_threshold_ms do
      Logger.info([
        "SLOW OPERATION ",
        Integer.to_string(duration_ms),
        "ms",
        ?\n,
        metadata.options[:document] |> String.split() |> Enum.intersperse(?\s),
        ?\s,
        inspect(metadata.options[:variables], charlists: false)
      ])
    end
  end
end
