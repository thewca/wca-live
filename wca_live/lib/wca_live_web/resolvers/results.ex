defmodule WcaLiveWeb.Resolvers.Results do
  alias WcaLive.Competitions

  def update_result(_parent, %{id: id, input: input}, _resolution) do
    result = Competitions.get_result!(id)
    Competitions.update_result(result, input)
  end
end
