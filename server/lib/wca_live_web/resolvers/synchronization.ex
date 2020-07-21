defmodule WcaLiveWeb.Resolvers.Synchronization do
  alias WcaLive.Synchronization

  def importable_competitions(_parent, _args, %{context: %{current_user: current_user}}) do
    Synchronization.get_importable_competition_briefs(current_user)
  end

  def importable_competitions(_parent, _args, _resolution), do: {:ok, []}
end
