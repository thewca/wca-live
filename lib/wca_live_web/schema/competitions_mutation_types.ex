defmodule WcaLiveWeb.Schema.CompetitionsMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :competitions_mutations do
    field :update_competition_access, non_null(:update_competition_access_payload) do
      arg :input, non_null(:update_competition_access_input)
      resolve &Resolvers.CompetitionsMutation.update_competition_access/3
    end

    field :anonymize_person, non_null(:anonymize_person_payload) do
      arg :input, non_null(:anonymize_person_input)
      resolve &Resolvers.CompetitionsMutation.anonymize_person/3
    end
  end

  # Inputs

  input_object :update_competition_access_input do
    field :id, non_null(:id)
    field :staff_members, non_null(list_of(non_null(:staff_member_input)))
  end

  input_object :staff_member_input do
    field :id, :id
    field :user_id, non_null(:id)
    field :roles, non_null(list_of(non_null(:string)))
  end

  input_object :anonymize_person_input do
    field :wca_id, non_null(:string)
  end

  # Payloads

  object :update_competition_access_payload do
    field :competition, :competition
  end

  object :anonymize_person_payload do
    field :competition_count, non_null(:integer)
  end
end
