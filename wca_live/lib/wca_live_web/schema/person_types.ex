defmodule WcaLiveWeb.Schema.PersonTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A person relevant to a competition."
  object :person do
    field :id, non_null(:id)
    field :wca_user_id, non_null(:integer)
    field :wca_id, :string

    @desc "A small number, unique within the given competition, useful for scoretaking. " <>
            "Note: may be null for people who doesn't actually compete."
    field :registrant_id, :integer
    field :name, :string

    field :country, non_null(:country) do
      resolve &Resolvers.People.person_country/3
    end

    field :avatar, :avatar do
      resolve &Resolvers.People.person_avatar/3
    end

    field :roles, non_null(list_of(non_null(:string)))

    field :results, non_null(list_of(non_null(:result))) do
      resolve dataloader(:db)
    end

    field :assignments, non_null(list_of(non_null(:assignment))) do
      resolve dataloader(:db)
    end
  end

  object :person_queries do
    field :person, :person do
      arg :id, non_null(:id)
      resolve &Resolvers.People.get_person/3
    end
  end
end
