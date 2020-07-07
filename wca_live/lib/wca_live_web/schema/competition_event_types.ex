defmodule WcaLiveWeb.Schema.CompetitionEventTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A competition event."
  object :competition_event do
    field :id, non_null(:id)
    field :competitor_limit, :integer

    field :event, non_null(:event) do
      resolve &Resolvers.CompetitionEvents.competition_event_event/3
    end

    field :rounds, non_null(list_of(non_null(:round))) do
      resolve dataloader(:db)
    end
  end
end
