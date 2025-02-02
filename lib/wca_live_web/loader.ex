defmodule WcaLiveWeb.Loader do
  @moduledoc """
  A module encapsulating custom dataloader behaviour.

  Dataloader provides a mechanism for loading data in batches
  to avoid the N+1 queries problem.

  See https://hexdocs.pm/absinthe/dataloader.html for more details.
  """

  require Ecto.Query

  alias WcaLive.Competitions
  alias WcaLive.Scoretaking

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

  defp query(Competitions.Person, %{competitor: true}) do
    Competitions.Person |> Competitions.Person.where_competitor()
  end

  defp query(Scoretaking.Round, _args) do
    Scoretaking.Round |> Scoretaking.Round.order_by_number()
  end

  defp query(Scoretaking.Result, _args) do
    Scoretaking.Result |> Scoretaking.Result.order_by_ranking()
  end

  defp query(querable, _args), do: querable
end
