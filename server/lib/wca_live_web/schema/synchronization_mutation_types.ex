defmodule WcaLiveWeb.Schema.SynchronizationMutationTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  object :synchronization_mutations do
    field :import_competition, non_null(:import_competition_payload) do
      arg :input, non_null(:import_competition_input)
      resolve &Resolvers.SynchronizationMutation.import_competition/3
    end

    field :synchronize_competition, non_null(:synchronize_competition_payload) do
      arg :input, non_null(:synchronize_competition_input)
      resolve &Resolvers.SynchronizationMutation.synchronize_competition/3
    end
  end

  # Inputs

  input_object :import_competition_input do
    field :wca_id, non_null(:string)
  end

  input_object :synchronize_competition_input do
    field :id, non_null(:id)
  end

  object :import_competition_payload do
    field :competition, :competition
  end

  object :synchronize_competition_payload do
    field :competition, :competition
  end
end
