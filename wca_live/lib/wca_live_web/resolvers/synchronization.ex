defmodule WcaLiveWeb.Resolvers.Synchronization do
  alias WcaLive.Competitions
  alias WcaLive.Synchronization
  alias WcaLive.Scoretaking

  def import_competition(_parent, %{wca_id: wca_id}, %{context: %{current_user: current_user}}) do
    Synchronization.import_competition(wca_id, current_user)
  end

  def import_competition(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def synchronize_competition(_parent, %{id: id}, %{context: %{current_user: current_user}}) do
    competition = Competitions.get_competition!(id)

    if Scoretaking.Access.can_scoretake_competition?(current_user, competition) do
      Synchronization.synchronize_competition(competition)
    else
      {:error, "access denied"}
    end
  end

  def synchronize_competition(_parent, _args, _resolution), do: {:error, "not authenticated"}
end
