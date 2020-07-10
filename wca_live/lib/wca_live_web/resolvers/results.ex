defmodule WcaLiveWeb.Resolvers.Results do
  alias WcaLive.Scoretaking

  def update_result(_parent, %{id: id, input: input}, _resolution) do
    result = Scoretaking.get_result!(id)
    Scoretaking.update_result(result, input)
  end
end
