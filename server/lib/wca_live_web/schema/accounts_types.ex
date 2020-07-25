defmodule WcaLiveWeb.Schema.AccountsTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  object :accounts_queries do
    field :current_user, :user do
      resolve &Resolvers.Accounts.current_user/3
    end

    field :users, non_null(list_of(non_null(:user))) do
      arg :filter, :string
      resolve &Resolvers.Accounts.list_users/3
    end
  end

  @desc "A user of the application, imported from the WCA website during the OAuth procedure."
  object :user do
    field :id, non_null(:id)
    field :wca_user_id, non_null(:integer)
    field :wca_id, :string
    field :name, non_null(:string)

    field :avatar, :avatar do
      resolve &Resolvers.Accounts.user_avatar/3
    end

    field :staff_members, non_null(list_of(non_null(:staff_member))) do
      resolve dataloader(:db)
    end
  end
end
