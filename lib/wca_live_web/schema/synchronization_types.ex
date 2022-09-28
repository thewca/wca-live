defmodule WcaLiveWeb.Schema.SynchronizationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :synchronization_queries do
    @desc "A list of competitions that the current user may import from the WCA website."
    field :importable_competitions, non_null(list_of(non_null(:competition_brief))) do
      resolve &Resolvers.Synchronization.importable_competitions/3
    end
  end

  @desc "A small subset of competition information. Used to represent competitions fetched from the WCA API."
  object :competition_brief do
    field :wca_id, non_null(:string)
    field :name, non_null(:string)
    field :short_name, non_null(:string)
    field :start_date, non_null(:date)
    field :end_date, non_null(:date)
  end
end
