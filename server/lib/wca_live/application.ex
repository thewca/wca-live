defmodule WcaLive.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    :ok =
      :telemetry.attach(
        "slow-query-handler",
        [:wca_live, :repo, :query],
        &WcaLive.Telemetry.handle_event/4,
        %{}
      )

    children = [
      # Start the Ecto repository
      WcaLive.Repo,
      # Start the Telemetry supervisor
      WcaLiveWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: WcaLive.PubSub},
      # Start the Endpoint (http/https)
      WcaLiveWeb.Endpoint,
      # Start the Absinthe Subscription supervisor
      {Absinthe.Subscription, WcaLiveWeb.Endpoint},
      # Start RecordsStore with official WCA records cache
      WcaLive.Wca.RecordsStore
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: WcaLive.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    WcaLiveWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
