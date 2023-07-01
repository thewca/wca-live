defmodule WcaLiveWeb.Schema.AccountsMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :accounts_mutations do
    field :generate_one_time_code, non_null(:generate_one_time_code_payload) do
      resolve &Resolvers.AccountsMutation.generate_one_time_code/3
    end
  end

  # Payloads

  object :generate_one_time_code_payload do
    field :one_time_code, :one_time_code
  end
end
