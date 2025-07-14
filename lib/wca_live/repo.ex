defmodule WcaLive.Repo do
  @moduledoc """
  A data repository for interacting with the underlying database.

  See https://hexdocs.pm/ecto/Ecto.Repo.html for more information
  and available functions.
  """

  use Ecto.Repo,
    otp_app: :wca_live,
    adapter: Ecto.Adapters.Postgres

  require Ecto.Query

  @doc """
  Like `get/3`, but wraps the result in an ok/error tuple.

  Raises an error if many records are found.

  ## Example

      Repo.fetch(User, 1)
  """
  @spec fetch(Ecto.Queryable.t(), term()) :: {:ok, Ecto.Schema.t()} | {:error, Ecto.Queryable.t()}
  def fetch(query, id) do
    query
    |> Ecto.Query.where(id: ^id)
    |> fetch()
  end

  @doc """
  Performs the given query expecting a single struct
  and wraps it in an ok/error tuple.

  Raises an error if the query results in many records.
  """
  @spec fetch(Ecto.Queryable.t()) :: {:ok, Ecto.Schema.t()} | {:error, Ecto.Queryable.t()}
  def fetch(query) do
    case all(query) do
      [] -> {:error, query}
      [struct] -> {:ok, struct}
      _ -> raise "expected one or no items, got many items #{inspect(query)}"
    end
  end

  @doc """
  Similar to `transaction/2`, except it automatically rolls back the
  transaction if the function returns an error.
  """
  @spec transaction_with(
          (-> {:ok, term()} | {:error, term()}),
          keyword()
        ) :: {:ok, term()} | {:error, term()}
  def transaction_with(fun, options \\ []) when is_function(fun, 0) and is_list(options) do
    transaction(
      fn ->
        case fun.() do
          {:ok, result} ->
            result

          {:error, reason} ->
            rollback(reason)

          other ->
            raise ArgumentError,
                  "expected to return {:ok, _} or {:error, _}, got: #{inspect(other)}"
        end
      end,
      options
    )
  end
end
