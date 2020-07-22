defmodule WcaLiveWeb.Resolvers.Competitions do
  alias WcaLive.Competitions
  alias WcaLive.Scoretaking
  alias WcaLive.Wca.{Country, Event}

  # Competitions

  def list_competitions(_parent, _args, _resolution) do
    {:ok, Competitions.list_competitions()}
  end

  def get_competition(_parent, %{id: id}, _resolution) do
    {:ok, Competitions.get_competition(id)}
  end

  def competition_podiums(competition, _args, _resolution) do
    {:ok, Scoretaking.list_podiums(competition)}
  end

  # Competition events

  def competition_event_event(%{event_id: event_id}, _args, _resolution) do
    {:ok, Event.get_by_id!(event_id)}
  end

  # People

  def person_avatar(%{avatar_url: url, avatar_thumb_url: thumb_url}, _args, _resolution) do
    avatar = url && thumb_url && %{url: url, thumb_url: thumb_url}
    {:ok, avatar}
  end

  def person_country(%{country_iso2: iso2}, _args, _resolution) do
    {:ok, Country.get_by_iso2!(iso2)}
  end

  def get_person(_parent, %{id: id}, _resolution) do
    {:ok, Competitions.get_person(id)}
  end

  # Venues

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
