defmodule WcaLiveWeb.Schema do
  use Absinthe.Schema

  import_types Absinthe.Type.Custom
  import_types WcaLiveWeb.Schema.ActivityTypes
  import_types WcaLiveWeb.Schema.AssignmentTypes
  import_types WcaLiveWeb.Schema.AvatarTypes
  import_types WcaLiveWeb.Schema.CompetitionEventTypes
  import_types WcaLiveWeb.Schema.CompetitionTypes
  import_types WcaLiveWeb.Schema.CountryTypes
  import_types WcaLiveWeb.Schema.EventTypes
  import_types WcaLiveWeb.Schema.PersonTypes
  import_types WcaLiveWeb.Schema.ResultTypes
  import_types WcaLiveWeb.Schema.RoomTypes
  import_types WcaLiveWeb.Schema.RoundTypes
  import_types WcaLiveWeb.Schema.UserTypes
  import_types WcaLiveWeb.Schema.VenueTypes

  query do
    import_fields :user_queries
    import_fields :competition_queries
    import_fields :round_queries
    import_fields :person_queries
  end

  mutation do
    import_fields :competition_mutations
    import_fields :round_mutations
    import_fields :result_mutations
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
