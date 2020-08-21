defmodule WcaLiveWeb.Schema do
  use Absinthe.Schema

  import_types Absinthe.Type.Custom
  import_types WcaLiveWeb.Schema.SharedTypes
  import_types WcaLiveWeb.Schema.AccountsTypes
  import_types WcaLiveWeb.Schema.CompetitionsTypes
  import_types WcaLiveWeb.Schema.CompetitionsMutationTypes
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
    import_fields :competitions_mutations
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
    loader = WcaLiveWeb.Loader.new_dataloader()

    Map.put(context, :loader, loader)
  end

  def plugins() do
    [Absinthe.Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end
end
