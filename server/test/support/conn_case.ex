defmodule WcaLiveWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  we enable the SQL sandbox, so changes done to the database
  are reverted at the end of every test. If you are using
  PostgreSQL, you can even run database tests asynchronously
  by setting `use WcaLiveWeb.ConnCase, async: true`, although
  this option is not recommended for other databases.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest
      import WcaLiveWeb.ConnCase

      alias WcaLiveWeb.Router.Helpers, as: Routes

      # The default endpoint for testing
      @endpoint WcaLiveWeb.Endpoint
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(WcaLive.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(WcaLive.Repo, {:shared, self()})
    end

    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  # Handle custom tags

  import WcaLive.Factory

  setup context do
    if context[:signed_in] do
      user =
        case context[:signed_in] do
          :admin ->
            insert(:user, wca_teams: ["wst"])

          true ->
            insert(:user)
        end

      token = WcaLiveWeb.Auth.generate_token(user.id)

      conn =
        context[:conn]
        |> Plug.Conn.put_req_header("authorization", "Bearer #{token}")

      {:ok, %{current_user: user, conn: conn}}
    else
      :ok
    end
  end

  def to_gql_id(number) when is_integer(number) do
    Integer.to_string(number)
  end
end
