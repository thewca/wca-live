defmodule WcaLiveWeb.Resolvers.Synchronization do
  alias WcaLive.Competitions
  alias WcaLive.Synchronization

  def import_competition(_parent, %{wca_id: wca_id}, %{context: %{current_user: current_user}}) do
    Synchronization.import_competition(wca_id, current_user)
  end

  def import_competition(_parent, _args, _resolution), do: {:error, "not authorized"}

  def synchronize_competition(_parent, %{id: id}, _resolution) do
    competition = Competitions.get_competition!(id)
    Synchronization.synchronize_competition(competition)
  end
end
