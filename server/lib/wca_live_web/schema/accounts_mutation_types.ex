defmodule WcaLiveWeb.Schema.AccountsMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :accounts_mutations do
    field :generate_one_time_code, non_null(:generate_one_time_code_payload) do
      resolve &Resolvers.AccountsMutation.generate_one_time_code/3
    end

    field :sign_in, non_null(:sign_in_payload) do
      arg :input, non_null(:sign_in_input)
      resolve &Resolvers.AccountsMutation.sign_in/3
    end
  end

  # Inputs

  input_object :sign_in_input do
    field :code, non_null(:string)
  end

  # Payloads

  object :generate_one_time_code_payload do
    field :one_time_code, :one_time_code
  end

  object :sign_in_payload do
    field :token, :string
    field :user, :user
  end
end
