defmodule WcaLiveWeb.Schema.AvatarTypes do
  use Absinthe.Schema.Notation

  @desc "An avatar."
  object :avatar do
    field :url, :string
    field :thumb_url, :string
  end
end
