use Mix.Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :wca_live, WcaLive.Repo,
  username: "postgres",
  password: "postgres",
  database: "wca_live_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :wca_live, WcaLiveWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

config :wca_live, WcaLive.Wca.OAuth,
  client_id: "example-application-id",
  client_secret: "example-secret",
  redirect_uri: "http://localhost:4000/oauth/callback",
  authorize_url: "https://staging.worldcubeassociation.org/oauth/authorize",
  token_url: "https://staging.worldcubeassociation.org/oauth/token"

config :wca_live, WcaLive.Wca.Api, api_url: "https://staging.worldcubeassociation.org/api/v0"
