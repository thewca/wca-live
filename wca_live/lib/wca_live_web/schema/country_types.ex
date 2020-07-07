defmodule WcaLiveWeb.Schema.CountryTypes do
  use Absinthe.Schema.Notation

  @desc "A country."
  object :country do
    field :iso2, non_null(:string)
    field :name, non_null(:string)
    field :continent_name, non_null(:string)
  end
end
