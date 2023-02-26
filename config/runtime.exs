# In this file, we load production configuration and secrets
# from environment variables.

import Config

if System.get_env("PHX_SERVER") do
  config :wca_live, WcaLiveWeb.Endpoint, server: true
end

if config_env() == :prod do
  host =
    System.get_env("HOST") ||
      raise """
      environment variable HOST is missing
      """

  # Configure the url host.
  # Phoenix uses this information when generating URLs.
  config :wca_live, WcaLiveWeb.Endpoint, url: [host: host, port: 80, scheme: "https"]

  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: postgres://USER:PASSWORD@HOST/DATABASE
      """

  # Configure the database
  config :wca_live, WcaLive.Repo,
    # ssl: true,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  config :wca_live, WcaLiveWeb.Endpoint,
    http: [
      port: String.to_integer(System.get_env("PORT") || "4000"),
      transport_options: [socket_opts: [:inet6]]
    ],
    secret_key_base: secret_key_base

  wca_host =
    System.get_env("WCA_HOST") ||
      raise """
      environment variable WCA_HOST is missing
      """

  wca_oauth_client_id =
    System.get_env("WCA_OAUTH_CLIENT_ID") ||
      raise """
      environment variable WCA_OAUTH_CLIENT_ID is missing
      """

  wca_oauth_client_secret =
    System.get_env("WCA_OAUTH_CLIENT_SECRET") ||
      raise """
      environment variable WCA_OAUTH_CLIENT_SECRET is missing
      """

  # Configure WCA OAuth.
  config :wca_live, WcaLive.Wca.OAuth,
    redirect_uri: "https://#{host}/oauth/callback",
    authorize_url: "https://#{wca_host}/oauth/authorize",
    token_url: "https://#{wca_host}/oauth/token",
    client_id: wca_oauth_client_id,
    client_secret: wca_oauth_client_secret

  # Use a real version of the WCA API, talking to an actual server.
  config :wca_live, :wca_api, WcaLive.Wca.Api.Http
  config :wca_live, WcaLive.Wca.Api.Http, api_url: "https://#{wca_host}/api/v0"

  if dns_query = System.get_env("CLUSTER_DNS_QUERY") do
    config :libcluster,
      topologies: [
        dns_poll: [
          strategy: Cluster.Strategy.DNSPoll,
          config: [
            polling_interval: 10_000,
            query: dns_query,
            # We name the nodes {release_name}@{ip}
            node_basename: "wca_live"
          ]
        ]
      ]
  end
end
