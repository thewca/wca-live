defmodule WcaLiveWeb.Context do
  @behaviour Plug

  import Plug.Conn
  alias WcaLive.Accounts

  def init(opts), do: opts

  @doc """
  Adds GraphQL context to the connection.
  The context includes current user extracted from an authorization token if present.
  """
  def call(conn, _) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  defp build_context(conn) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, current_user} <- authorize(token) do
      %{current_user: current_user}
    else
      _ -> %{}
    end
  end

  defp authorize(token) do
    with {:ok, user_id} <- WcaLiveWeb.Auth.verify_token(token) do
      case Accounts.get_user(user_id) do
        nil -> {:error, "invalid access token"}
        user -> {:ok, user}
      end
    end
  end
end
