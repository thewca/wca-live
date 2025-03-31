import Config

# Do not print debug messages in production
config :logger, level: :info

# New Relic
config :new_relic_agent, logs_in_context: :forwarder

# See `releases.exs` for the remaining configuration
# that depends on environment variables.
