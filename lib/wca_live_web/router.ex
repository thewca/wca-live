defmodule WcaLiveWeb.Router do
  use WcaLiveWeb, :router

  import WcaLiveWeb.UserAuth

  pipeline :browser do
    plug :fetch_session
    plug :fetch_current_user
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug :fetch_current_user
  end

  pipeline :graphql do
    plug WcaLiveWeb.Context
  end

  get "/health", WcaLiveWeb.HealthController, :index

  scope "/oauth", WcaLiveWeb do
    pipe_through :browser

    get "/authorize", AuthController, :authorize
    get "/callback", AuthController, :callback
  end

  scope "/auth", WcaLiveWeb do
    pipe_through :api

    post "/sign-in-by-code", AuthController, :sign_in_by_code
    delete "/sign-out", AuthController, :sign_out
  end

  scope "/pdf", WcaLiveWeb do
    get "/rounds/:id", PdfController, :round
  end

  scope "/link", WcaLiveWeb do
    get "/competitions/:wca_id", LinkController, :competition
    get "/competitions/:wca_id/rounds/:event_id/:round_number", LinkController, :round
  end

  scope "/api", WcaLiveWeb do
    pipe_through :api

    get "/competitions/:id/wcif", CompetitionController, :show_wcif
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
    forward "/", Absinthe.Plug,
      schema: WcaLiveWeb.Schema,
      analyze_complexity: true,
      max_complexity: 5000,
      # TODO: remove ths custom error rewrite in the future
      pipeline: {__MODULE__, :absinthe_pipeline}
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

  def absinthe_pipeline(config, opts) do
    config
    |> Absinthe.Plug.default_pipeline(opts)
    |> Absinthe.Pipeline.insert_after(
      Absinthe.Phase.Document.Result,
      WcaLiveWeb.ErrorRewritePhase
    )
  end
end
