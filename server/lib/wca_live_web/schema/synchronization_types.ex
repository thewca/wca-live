defmodule WcaLiveWeb.Schema.SynchronizationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  @desc "A small subset of competition information. Used to represent competitions fetched from the WCA API."
  object :competition_brief do
    field :wca_id, non_null(:string)
    field :name, non_null(:string)
    field :short_name, non_null(:string)
    field :start_date, non_null(:date)
    field :end_date, non_null(:date)
  end

  object :synchronization_queries do
    @desc "A list of competitions that the current user may import from the WCA website."
    field :importable_competitions, non_null(list_of(non_null(:competition_brief))) do
      resolve &Resolvers.Synchronization.importable_competitions/3
    end
  end

  object :synchronization_mutations do
    field :import_competition, :competition do
      arg :wca_id, non_null(:string)
      resolve &Resolvers.Synchronization.import_competition/3
    end

    field :synchronize_competition, :competition do
      arg :id, non_null(:id)
      resolve &Resolvers.Synchronization.synchronize_competition/3
    end
  end
end
