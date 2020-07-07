defmodule WcaLiveWeb.Schema.RoomTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers

  @desc "A venue room. May represent a physical room or just a logical one (like a stage)."
  object :room do
    field :id, non_null(:id)
    field :wcif_id, non_null(:integer)
    field :name, non_null(:string)
    field :color, non_null(:string)

    field :activities, non_null(list_of(non_null(:activity))) do
      resolve dataloader(:db)
    end
  end
end
