defmodule WcaLive.Repo do
  use Ecto.Repo,
    otp_app: :wca_live,
    adapter: Ecto.Adapters.Postgres

  require Ecto.Query

  def fetch(query, id) do
    query
    |> Ecto.Query.where(id: ^id)
    |> fetch()
  end

  def fetch(query) do
    case all(query) do
      [] -> {:error, query}
      [struct] -> {:ok, struct}
      _ -> raise "expected one or no items, got many items #{inspect(query)}"
    end
  end
end
