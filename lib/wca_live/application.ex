defmodule WcaLive.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    WcaLive.Telemetry.attach()

    cluster_topologies = Application.get_env(:libcluster, :topologies, [])

    children = [
      {Cluster.Supervisor, [cluster_topologies, [name: WcaLive.ClusterSupervisor]]},
      # Start the Ecto repository
      WcaLive.Repo,
      # Start the Telemetry supervisor
      WcaLiveWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: WcaLive.PubSub},
      # Start RecordsStore with official WCA records cache
      WcaLive.Wca.RecordsStore,
      # Start the Endpoint (http/https)
      WcaLiveWeb.Endpoint,
      # Start the Absinthe Subscription supervisor
      {Absinthe.Subscription, WcaLiveWeb.Endpoint}
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
