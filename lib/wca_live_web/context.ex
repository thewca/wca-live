defmodule WcaLiveWeb.Context do
  @moduledoc """
  A plug for attaching Absinthe context to the connection object.
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @doc """
  Adds GraphQL context to the connection.

  The context includes current user extracted from session if present.
  """
  @impl true
  def call(conn, _) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  defp build_context(conn) do
    if current_user = conn.assigns.current_user do
      %{current_user: current_user}
    else
      %{}
    end
  end
end
