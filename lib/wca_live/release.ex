defmodule WcaLive.Release do
  @moduledoc """
  Module with tasks runnable in production.
  """

  @app :wca_live

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    # Load the application without starting the supervision tree.
    Application.load(@app)

    # The database connection may be configured to use SSL
    # so we also need to start the relevant application.
    Application.ensure_all_started(:ssl)
  end
end
