defmodule WcaLiveWeb.Router do
  use WcaLiveWeb, :router

  pipeline :browser do
    plug :fetch_session
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  pipeline :graphql do
    plug WcaLiveWeb.Context
  end

  scope "/oauth", WcaLiveWeb do
    pipe_through :browser

    get "/authorize", AuthController, :authorize
    get "/callback", AuthController, :callback
  end

  scope "/api" do
    pipe_through :api
    pipe_through :graphql

    if Mix.env() == :dev do
      forward "/graphiql", Absinthe.Plug.GraphiQL, schema: WcaLiveWeb.Schema
    end

    forward "/", Absinthe.Plug, schema: WcaLiveWeb.Schema
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: WcaLiveWeb.Telemetry
    end
  end
end
