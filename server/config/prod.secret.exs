# In this file, we load production configuration and secrets
# from environment variables. You can also hardcode secrets,
# although such is generally not recommended and you have to
# remember to add this file to your .gitignore.
use Mix.Config

database_url =
  System.get_env("DATABASE_URL") ||
    raise """
    environment variable DATABASE_URL is missing.
    For example: ecto://USER:PASS@HOST/DATABASE
    """

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

# WCA OAuth configuration

wca_oauth_client_id =
  System.get_env("WCA_OAUTH_CLIENT_ID") ||
    raise """
    environment variable WCA_OAUTH_CLIENT_ID is missing.
    """

wca_oauth_client_secret =
  System.get_env("WCA_OAUTH_CLIENT_SECRET") ||
    raise """
    environment variable WCA_OAUTH_CLIENT_SECRET is missing.
    """

config :wca_live, WcaLive.Wca.OAuth,
  client_id: wca_oauth_client_id,
  client_secret: wca_oauth_client_secret

# ## Using releases (Elixir v1.9+)
#
# If you are doing OTP releases, you need to instruct Phoenix
# to start each relevant endpoint:
#
#     config :wca_live, WcaLiveWeb.Endpoint, server: true
#
# Then you can assemble a release by calling `mix release`.
# See `mix help release` for more information.
