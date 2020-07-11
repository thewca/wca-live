defmodule WcaLiveWeb.Resolvers.Venues do
  alias WcaLive.Wca.Country

  def venue_latitude(%{latitude_microdegrees: microdegrees}, _args, _resolution) do
    {:ok, microdegrees / 1.0e6}
  end

  def venue_longitude(%{longitude_microdegrees: microdegrees}, _args, _resolution) do
    {:ok, microdegrees / 1.0e6}
  end

  def venue_country(%{country_iso2: iso2}, _args, _resolution) do
    {:ok, Country.get_by_iso2!(iso2)}
  end
end
