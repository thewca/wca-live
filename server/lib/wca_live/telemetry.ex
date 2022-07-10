defmodule WcaLive.Telemetry do
  require Logger

  @slow_query_threshold_ms 800

  def handle_event([:wca_live, :repo, :query], measurements, metadata, _config) do
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
end
