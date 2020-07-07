defmodule WcaLiveWeb.Resolvers.Results do
  alias WcaLive.Competitions

  def update_result(_parent, %{id: id}, _resolution) do
    raise UndefinedFunctionError, message: "TODO"
  end
end
