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

    field :enter_results, non_null(:enter_results_payload) do
      arg :input, non_null(:enter_results_input)
      resolve &Resolvers.ScoretakingMutation.enter_results/3
    end

    field :add_person_to_round, non_null(:add_person_to_round_payload) do
      arg :input, non_null(:add_person_to_round_input)
      resolve &Resolvers.ScoretakingMutation.add_person_to_round/3
    end

    field :remove_person_from_round, non_null(:remove_person_from_round_payload) do
      arg :input, non_null(:remove_person_from_round_input)
      resolve &Resolvers.ScoretakingMutation.remove_person_from_round/3
    end

    field :remove_no_shows_from_round, non_null(:remove_no_shows_from_round_payload) do
      arg :input, non_null(:remove_no_shows_from_round_input)
      resolve &Resolvers.ScoretakingMutation.remove_no_shows_from_round/3
    end
  end

  # Inputs

  input_object :open_round_input do
    field :id, non_null(:id)
  end

  input_object :clear_round_input do
    field :id, non_null(:id)
  end

  input_object :enter_results_input do
    field :id, non_null(:id)
    field :results, non_null(list_of(non_null(:result_attempts_input)))
  end

  input_object :result_attempts_input do
    field :id, non_null(:id)
    field :attempts, non_null(list_of(non_null(:attempt_input)))
    field :entered_at, :datetime
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

  input_object :remove_no_shows_from_round_input do
    field :round_id, non_null(:id)
    field :person_ids, non_null(list_of(non_null(:id)))
  end

  # Payloads

  object :open_round_payload do
    field :round, :round
  end

  object :clear_round_payload do
    field :round, :round
  end

  object :enter_results_payload do
    field :round, :round
    field :results, list_of(:result)
  end

  object :add_person_to_round_payload do
    field :round, :round
  end

  object :remove_person_from_round_payload do
    field :round, :round
  end

  object :remove_no_shows_from_round_payload do
    field :round, :round
  end
end
