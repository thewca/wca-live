import Config

config :wca_live,
  ecto_repos: [WcaLive.Repo]

# Configure the endpoint.
config :wca_live, WcaLiveWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "gGJX3VwobpaORmDbmr0kXwPququm3j8IXPsp34d1Yc7RkQoJWwOs0l5kBQObpWpf",
  render_errors: [formats: [json: WcaLiveWeb.ErrorJSON], layout: false],
  pubsub_server: WcaLive.PubSub,
  live_view: [signing_salt: "B1YpR/Hz"]

# Configure Elixir's Logger.
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix.
config :phoenix, :json_library, Jason

# Use UTC timestamps in migrations.
config :wca_live, WcaLive.Repo, migration_timestamps: [type: :utc_datetime]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
