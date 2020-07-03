defmodule WcaLiveWeb.Schema.UserTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  @desc "A user of the application, imported from the WCA website during the OAuth procedure."
  object :user do
    field :id, non_null(:id)
    field :wca_user_id, non_null(:integer)
    field :wca_id, non_null(:string)
    field :name, non_null(:string)

    field :avatar, non_null(:avatar) do
      resolve &Resolvers.Users.user_avatar/3
    end
  end

  @desc "An avatar."
  object :avatar do
    field :url, :string
    field :thumb_url, :string
  end

  object :user_queries do
    field :current_user, :user do
      resolve &Resolvers.Users.current_user/3
    end
  end
end
