defmodule WcaLiveWeb.Resolvers.Records do
  alias WcaLive.Scoretaking

  def list_recent_records(_parent, _args, _resolution) do
    {:ok, Scoretaking.list_recent_records()}
  end
end
