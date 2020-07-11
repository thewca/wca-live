defmodule WcaLiveWeb.Resolvers.People do
  alias WcaLive.Competitions
  alias WcaLive.Wca.Country

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
end
