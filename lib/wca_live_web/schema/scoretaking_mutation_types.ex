defmodule WcaLiveWeb.Schema.ScoretakingMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :scoretaking_mutations do
    field :open_round, non_null(:open_round_payload) do
      arg :input, non_null(:open_round_input)
      resolve &Resolvers.ScoretakingMutation.open_round/3
    end

    field :clear_round, non_null(:clear_round_payload) do
      arg :input, non_null(:clear_round_input)
      resolve &Resolvers.ScoretakingMutation.clear_round/3
    end

    field :enter_result_attempts, non_null(:enter_result_attempts_payload) do
      arg :input, non_null(:enter_result_attempts_input)
      resolve &Resolvers.ScoretakingMutation.enter_result_attempts/3
    end

    field :add_person_to_round, non_null(:add_person_to_round_payload) do
      arg :input, non_null(:add_person_to_round_input)
      resolve &Resolvers.ScoretakingMutation.add_person_to_round/3
    end

    field :remove_person_from_round, non_null(:remove_person_from_round_payload) do
      arg :input, non_null(:remove_person_from_round_input)
      resolve &Resolvers.ScoretakingMutation.remove_person_from_round/3
    end
  end

  # Inputs

  input_object :open_round_input do
    field :id, non_null(:id)
  end

  input_object :clear_round_input do
    field :id, non_null(:id)
  end

  input_object :enter_result_attempts_input do
    field :id, non_null(:id)
    field :attempts, non_null(list_of(non_null(:attempt_input)))
  end

  input_object :attempt_input do
    field :result, non_null(:integer)
    field :reconstruction, :string
  end

  input_object :add_person_to_round_input do
    field :round_id, non_null(:id)
    field :person_id, non_null(:id)
  end

  input_object :remove_person_from_round_input do
    field :round_id, non_null(:id)
    field :person_id, non_null(:id)
    field :replace, non_null(:boolean)
  end

  # Payloads

  object :open_round_payload do
    field :round, :round
  end

  object :clear_round_payload do
    field :round, :round
  end

  object :enter_result_attempts_payload do
    field :result, :result
  end

  object :add_person_to_round_payload do
    field :round, :round
  end

  object :remove_person_from_round_payload do
    field :round, :round
  end
end
