defmodule WcaLiveWeb.Router do
  @moduledoc """
  The router configures how a web request proceeds
  depending on the requested path.
  """

  use WcaLiveWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :graphql do
    plug WcaLiveWeb.Context
  end

  scope "/oauth", WcaLiveWeb do
    get "/authorize", AuthController, :authorize
    get "/callback", AuthController, :callback
  end

  scope "/pdf", WcaLiveWeb do
    get "/rounds/:id", PdfController, :round
  end

  scope "/link", WcaLiveWeb do
    get "/competitions/:wca_id", LinkController, :competition
    get "/competitions/:wca_id/rounds/:event_id/:round_number", LinkController, :round
  end

  scope "/api" do
    pipe_through :api
    pipe_through :graphql

    # Enables GraphiQL interactive editor
    # for crafting GraphQL queries during development.
    if Mix.env() == :dev do
      forward "/graphiql", Absinthe.Plug.GraphiQL,
        schema: WcaLiveWeb.Schema,
        socket: WcaLiveWeb.UserSocket
    end

    # /api is a GrpahQL endpoint, so further processing
    # is forwarded to the schema implementation.
    forward "/", Absinthe.Plug, schema: WcaLiveWeb.Schema
  end

  # Enable LiveDashboard only for development
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: WcaLiveWeb.Telemetry
    end
  end

  get "/*parts", WcaLiveWeb.CatchAllController, :catch_all
end
