defmodule WcaLiveWeb.Schema.VenueTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A competition venue. Represents a physical location."
  object :venue do
    field :id, non_null(:id)
    field :wcif_id, non_null(:integer)
    field :name, non_null(:string)

    field :latitude, non_null(:float) do
      resolve &Resolvers.Venues.venue_latitude/3
    end

    field :longitude, non_null(:float) do
      resolve &Resolvers.Venues.venue_longitude/3
    end

    field :country, non_null(:country) do
      resolve &Resolvers.Venues.venue_country/3
    end

    field :timezone, non_null(:string)

    field :rooms, non_null(list_of(non_null(:room))) do
      resolve dataloader(:db)
    end
  end
end
