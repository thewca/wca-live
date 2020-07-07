defmodule WcaLiveWeb.Schema.ActivityTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers

  @desc "An activity taking place in a specified timeframe in a single room."
  object :activity do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :wcif_id, non_null(:integer)
    field :activity_code, non_null(:string)
    field :start_time, non_null(:datetime)
    field :end_time, non_null(:datetime)

    field :activities, non_null(list_of(non_null(:activity))) do
      resolve dataloader(:db)
    end

    field :assignments, non_null(list_of(non_null(:assignment))) do
      resolve dataloader(:db)
    end

    @desc "The corresponding round for round activities, otherwise null."
    field :round, :round do
      resolve dataloader(:db)
    end
  end
end
