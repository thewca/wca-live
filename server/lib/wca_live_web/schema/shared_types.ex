defmodule WcaLiveWeb.Schema.SharedTypes do
  use Absinthe.Schema.Notation

  @desc "An avatar."
  object :avatar do
    field :url, :string
    field :thumb_url, :string
  end

  @desc "A country."
  object :country do
    field :iso2, non_null(:string)
    field :name, non_null(:string)
    field :continent_name, non_null(:string)
  end

  @desc "A WCA event."
  object :event do
    field :id, non_null(:id)
    field :name, non_null(:string)
  end
end
