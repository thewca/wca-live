defmodule WcaLiveWeb.Schema.EventTypes do
  use Absinthe.Schema.Notation

  @desc "A WCA event."
  object :event do
    field :id, non_null(:id)
    field :name, non_null(:string)
  end
end
