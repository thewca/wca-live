import Config

# Configure the database
config :wca_live, WcaLive.Repo,
  username: "postgres",
  password: "postgres",
  database: "wca_live_dev",
  hostname: System.get_env("DB_HOST", "localhost"),
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with webpack to recompile .js and .css sources.
config :wca_live, WcaLiveWeb.Endpoint,
  http: [port: 4000],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    # Start Vite with a wrapper to avoid leaving zombie processes
    "#{Path.expand("../client/wrapper.sh", __DIR__)}": [
      "npm",
      "run",
      "dev",
      cd: Path.expand("../client", __DIR__)
    ]
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

# Configure WCA OAuth with test client id and secret.
config :wca_live, WcaLive.Wca.OAuth,
  client_id: "example-application-id",
  client_secret: "example-secret",
  redirect_uri: "http://localhost:4000/oauth/callback",
  authorize_url: "https://staging.worldcubeassociation.org/oauth/authorize",
  token_url: "https://staging.worldcubeassociation.org/oauth/token"

# Use a real version of the WCA API, talking to the staging server.
config :wca_live, :wca_api, WcaLive.Wca.Api.Http
config :wca_live, WcaLive.Wca.Api.Http, api_url: "https://staging.worldcubeassociation.org/api/v0"
