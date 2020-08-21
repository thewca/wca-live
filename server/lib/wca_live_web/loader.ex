defmodule WcaLiveWeb.Loader do
  require Ecto.Query

  alias WcaLive.Competitions.Person
  alias WcaLive.Scoretaking.{Round, Result}

  def new_dataloader() do
    source = Dataloader.Ecto.new(WcaLive.Repo, query: &query/2)

    Dataloader.new()
    |> Dataloader.add_source(:db, source)
  end

  defp query(Person, %{competitor: true}) do
    Person |> Person.where_competitor()
  end

  defp query(Round, _args) do
    Round |> Round.order_by_number() |> Ecto.Query.preload(:results)
  end

  defp query(Result, _args) do
    Result |> Result.order_by_ranking()
  end

  defp query(querable, _args), do: querable
end
