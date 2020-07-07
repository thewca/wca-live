defmodule WcaLiveWeb.Resolvers.Competitions do
  alias WcaLive.Competitions

  def list_competitions(_parent, _args, _resolution) do
    {:ok, Competitions.list_competitions()}
  end

  def get_competition(_parent, %{id: id}, _resolution) do
    {:ok, Competitions.get_competition(id)}
  end
end
