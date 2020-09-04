defmodule WcaLiveWeb.Loader do
  @moduledoc """
  A module encapsulating custom dataloader behaviour.

  Dataloader provides a mechanism for loading data in batches
  to avoid the N+1 queries problem.

  See https://hexdocs.pm/absinthe/dataloader.html for more details.
  """

  require Ecto.Query

  alias WcaLive.Competitions.Person
  alias WcaLive.Scoretaking.{Round, Result}

  @doc """
  Returns a new dataloader with `:db` data source
  on top of `WcaLive.Repo`.
  """
  @spec new_dataloader :: Dataloader.t()
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
