defmodule WcaLiveWeb.Schema.CompetitionTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A competition, imported from the WCA website."
  object :competition do
    field :id, non_null(:id)
    field :wca_id, non_null(:string)
    field :name, non_null(:string)
    field :short_name, non_null(:string)
    field :end_date, non_null(:date)
    field :start_date, non_null(:date)
    field :start_time, non_null(:datetime)
    field :end_time, non_null(:datetime)
    field :competitor_limit, :integer
    field :synchronized_at, non_null(:datetime)

    field :competition_events, non_null(list_of(non_null(:competition_event))) do
      resolve dataloader(:db)
    end

    field :venues, non_null(list_of(non_null(:venue))) do
      resolve dataloader(:db)
    end

    # TODO: competitors (only accepted?)
  end

  object :competition_queries do
    field :competitions, non_null(list_of(non_null(:competition))) do
      resolve &Resolvers.Competitions.list_competitions/3
    end

    field :competition, :competition do
      arg :id, non_null(:id)
      resolve &Resolvers.Competitions.get_competition/3
    end
  end
end
