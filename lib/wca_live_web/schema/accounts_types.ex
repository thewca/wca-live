defmodule WcaLiveWeb.Schema.AccountsTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  object :accounts_queries do
    field :current_user, :user do
      resolve &Resolvers.Accounts.current_user/3
    end

    field :active_scoretaking_tokens, non_null(list_of(non_null(:scoretaking_token))) do
      resolve &Resolvers.Accounts.active_scoretaking_tokens/3
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

    field :competitors, non_null(list_of(non_null(:person))) do
      resolve dataloader(:db, :people, args: %{competitor: true})
    end
  end

  @desc "A temporary code generated for quick sign in."
  object :one_time_code do
    field :id, non_null(:id)
    field :code, non_null(:string)
    field :expires_at, non_null(:datetime)
    field :inserted_at, non_null(:datetime)
  end

  @desc "A competition-scoped token for scoretaking API calls from external systems."
  object :scoretaking_token do
    field :id, non_null(:id)
    field :token, non_null(:string)
    field :inserted_at, non_null(:datetime)

    field :competition, non_null(:competition) do
      resolve dataloader(:db)
    end
  end
end
