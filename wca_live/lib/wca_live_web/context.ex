defmodule WcaLiveWeb.Context do
  @behaviour Plug

  import Plug.Conn
  alias WcaLive.Accounts

  def init(opts), do: opts

  @doc """
  Adds GraphQL context to the connection.
  The context includes current user extracted from the session if present.
  """
  def call(conn, _) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  defp build_context(conn) do
    case get_session(conn, :user_id) do
      nil ->
        %{}

      user_id ->
        current_user = Accounts.get_user!(user_id)
        %{current_user: current_user}
    end
  end
end
