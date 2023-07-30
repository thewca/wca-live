defmodule WcaLive.Storage do
  @moduledoc """
  Key-value storage persisted in the database.
  """

  import Ecto.Query, warn: false

  alias WcaLive.Repo

  defmodule Term do
    use WcaLive.Schema

    @primary_key {:key, :string, []}
    schema "terms" do
      field :value, :binary
    end
  end

  @doc """
  Puts the given value in storage under `key`.
  """
  @spec put(String.t(), term()) :: :ok | :error
  def put(key, value) do
    term = %Term{key: key, value: :erlang.term_to_binary(value)}

    case Repo.insert(term, on_conflict: :replace_all, conflict_target: :key) do
      {:ok, _} -> :ok
      {:error, _} -> :error
    end
  end

  @doc """
  Fetches value for the given `key` from storage.
  """
  @spec fetch(String.t()) :: {:ok, term()} | :error
  def fetch(key) do
    if result = Repo.get(Term, key) do
      {:ok, :erlang.binary_to_term(result.value)}
    else
      :error
    end
  end
end
