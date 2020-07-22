defmodule WcaLiveWeb.Schema do
  use Absinthe.Schema

  import_types Absinthe.Type.Custom
  import_types WcaLiveWeb.Schema.SharedTypes
  import_types WcaLiveWeb.Schema.AccountsTypes
  import_types WcaLiveWeb.Schema.CompetitionsTypes
  import_types WcaLiveWeb.Schema.SynchronizationTypes
  import_types WcaLiveWeb.Schema.SynchronizationMutationTypes
  import_types WcaLiveWeb.Schema.ScoretakingTypes
  import_types WcaLiveWeb.Schema.ScoretakingMutationTypes
  import_types WcaLiveWeb.Schema.ScoretakingSubscriptionTypes

  query do
    import_fields :accounts_queries
    import_fields :competitions_queries
    import_fields :synchronization_queries
    import_fields :scoretaking_queries
  end

  mutation do
    import_fields :synchronization_mutations
    import_fields :scoretaking_mutations
  end

  subscription do
    import_fields :scoretaking_subscriptions
  end

  def middleware(middleware, _field, %{identifier: :mutation}) do
    middleware ++ [WcaLiveWeb.Schema.Middleware.HandleErrors]
  end

  def middleware(middleware, _field, _object), do: middleware

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

  # TODO: where to place all of that?

  require Ecto.Query

  def query(WcaLive.Competitions.Person, %{competitor: true}) do
    WcaLive.Competitions.Person |> WcaLive.Competitions.Person.where_competitor()
  end

  def query(WcaLive.Scoretaking.Round, _args) do
    WcaLive.Scoretaking.Round |> Ecto.Query.preload(:results)
  end

  def query(WcaLive.Scoretaking.Result, _args) do
    WcaLive.Scoretaking.Result |> WcaLive.Scoretaking.Result.order_by_ranking()
  end

  def query(querable, _args), do: querable
end
