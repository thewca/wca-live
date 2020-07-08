defmodule WcaLiveWeb.Resolvers.Competitions do
  alias WcaLive.Competitions

  def list_competitions(_parent, _args, _resolution) do
    {:ok, Competitions.list_competitions()}
  end

  def get_competition(_parent, %{id: id}, _resolution) do
    {:ok, Competitions.get_competition(id)}
  end

  def import_competition(_parent, %{wca_id: wca_id}, %{context: %{current_user: current_user}}) do
    Competitions.import_competition(wca_id, current_user)
  end

  def import_competition(_parent, _args, _resolution), do: {:error, "not authorized"}

  def synchronize_competition(_parent, %{id: id}, _resolution) do
    competition = Competitions.get_competition!(id)
    Competitions.synchronize_competition(competition)
  end
end
