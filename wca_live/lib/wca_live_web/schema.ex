defmodule WcaLiveWeb.Schema do
  use Absinthe.Schema

  import_types Absinthe.Type.Custom
  import_types WcaLiveWeb.Schema.SharedTypes
  import_types WcaLiveWeb.Schema.AccountsTypes
  import_types WcaLiveWeb.Schema.CompetitionsTypes
  import_types WcaLiveWeb.Schema.ScoretakingTypes

  query do
    import_fields :accounts_queries
    import_fields :competitions_queries
    import_fields :scoretaking_queries
  end

  mutation do
    import_fields :competitions_mutations
    import_fields :scoretaking_mutations
  end

  def context(context) do
    source = Dataloader.Ecto.new(WcaLive.Repo, query: &WcaLiveWeb.Schema.query/2)

    loader =
      Dataloader.new()
      |> Dataloader.add_source(:db, source)

    Map.put(context, :loader, loader)
  end

  def plugins() do
    [Absinthe.Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end

  import Ecto.Query, warn: false

  # TODO: figure out if there's a better option than always preloading that.
  def query(WcaLive.Scoretaking.Round, _args) do
    from p in WcaLive.Scoretaking.Round, preload: [:results]
  end

  def query(querable, _args), do: querable
end
