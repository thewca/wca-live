use Mix.Config

# Configure the url host.
# Phoenix uses this information when generating URLs.
config :wca_live, WcaLiveWeb.Endpoint, url: [host: "live.worldcubeassociation.org", port: 80]

# Do not print debug messages in production
config :logger, level: :info

# Configure WCA OAuth. Cliend id and secret are loaded in `releases.exs`.
config :wca_live, WcaLive.Wca.OAuth,
  redirect_uri: "https://live.worldcubeassociation.org/oauth/callback",
  authorize_url: "https://www.worldcubeassociation.org/oauth/authorize",
  token_url: "https://www.worldcubeassociation.org/oauth/token"

# Use a real version of the WCA API, talking to the production server.
config :wca_live, :wca_api, WcaLive.Wca.Api.Http
config :wca_live, WcaLive.Wca.Api.Http, api_url: "https://www.worldcubeassociation.org/api/v0"
