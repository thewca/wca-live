defmodule WcaLiveWeb.Schema.AccountsMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :accounts_mutations do
    field :generate_one_time_code, non_null(:generate_one_time_code_payload) do
      resolve &Resolvers.AccountsMutation.generate_one_time_code/3
    end

    field :generate_scoretaking_token, non_null(:generate_scoretaking_token_payload) do
      arg :input, non_null(:generate_scoretaking_token_input)
      resolve &Resolvers.AccountsMutation.generate_scoretaking_token/3
    end

    field :delete_scoretaking_token, non_null(:delete_scoretaking_token_payload) do
      arg :input, non_null(:delete_scoretaking_token_input)
      resolve &Resolvers.AccountsMutation.delete_scoretaking_token/3
    end
  end

  # Inputs

  input_object :generate_scoretaking_token_input do
    field :competition_id, non_null(:id)
  end

  input_object :delete_scoretaking_token_input do
    field :id, non_null(:id)
  end

  # Payloads

  object :generate_one_time_code_payload do
    field :one_time_code, :one_time_code
  end

  object :generate_scoretaking_token_payload do
    field :scoretaking_token, :scoretaking_token
  end

  object :delete_scoretaking_token_payload do
    field :scoretaking_token, :scoretaking_token
  end
end
