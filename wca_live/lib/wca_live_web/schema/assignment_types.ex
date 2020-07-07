defmodule WcaLiveWeb.Schema.AssignmentTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers

  @desc "An object representing person's assignment to an activity."
  object :assignment do
    field :id, non_null(:id)
    field :assignment_code, non_null(:string)
    field :station_number, :integer

    field :person, non_null(:person) do
      resolve dataloader(:db)
    end

    field :activity, non_null(:activity) do
      resolve dataloader(:db)
    end
  end
end
