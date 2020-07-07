defmodule WcaLiveWeb.Resolvers.CompetitionEvents do
  alias WcaLive.Competitions

  def competition_event_event(%{event_id: event_id}, _args, _resolution) do
    {:ok, Competitions.Event.get_by_id!(event_id)}
  end
end
