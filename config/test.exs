import Config

# Configure the database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :wca_live, WcaLive.Repo,
  username: "postgres",
  password: "postgres",
  database: "wca_live_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: System.get_env("DB_HOST", "localhost"),
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :wca_live, WcaLiveWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

config :wca_live, :wca_api,
  url: "https://staging.worldcubeassociation.org/api/v0",
  # In tests, we use a global stub for the records request, because
  # the RecordsStore fetches records in the background
  records_req_options: [plug: WcaLive.RecordsStub]
