defmodule WcaLiveWeb.Schema.CompetitionsMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :competitions_mutations do
    field :update_competition_access_settings, non_null(:update_competition_access_settings_payload) do
      arg :input, non_null(:update_competition_access_settings_input)
      resolve &Resolvers.CompetitionsMutation.update_competition_access_settings/3
    end
  end

  # Inputs

  input_object :update_competition_access_settings_input do
    field :id, non_null(:id)
    field :staff_members, non_null(list_of(non_null(:staff_member_input)))
  end

  input_object :staff_member_input do
    field :id, :id
    field :user_id, non_null(:id)
    field :roles, non_null(list_of(non_null(:string)))
  end

  # Payloads

  object :update_competition_access_settings_payload do
    field :competition, :competition
  end
end
