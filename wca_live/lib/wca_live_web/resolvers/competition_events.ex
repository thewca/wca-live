defmodule WcaLiveWeb.Resolvers.CompetitionEvents do
  alias WcaLive.Wca.Event

  def competition_event_event(%{event_id: event_id}, _args, _resolution) do
    {:ok, Event.get_by_id!(event_id)}
  end
end
