defmodule WcaLiveWeb.Schema.ResultTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A result. Represents person's participation in a single round."
  object :result do
    field :id, non_null(:id)
    field :ranking, :integer
    field :best, :integer
    field :average, :integer
    # TODO: maybe include tags in best/average
    field :average_record_tag, :string
    field :single_record_tag, :string

    field :attempts, non_null(list_of(non_null(:attempt)))

    field :person, non_null(:person) do
      resolve dataloader(:db)
    end

    field :round, non_null(:round) do
      resolve dataloader(:db)
    end
  end

  @desc "A single attempt done by a competitor."
  object :attempt do
    # TODO: is this the proper name though? ^^
    field :result, non_null(:integer)
    field :reconstruction, :string
  end

  input_object :result_input do
    field :attempts, non_null(list_of(non_null(:attempt_input)))
  end

  input_object :attempt_input do
    field :result, non_null(:integer)
    field :reconstruction, :string
  end

  object :result_mutations do
    # TODO: what type to return
    field :update_result, :result do
      arg :id, non_null(:id)
      arg :input, non_null(:result_input)
      resolve &Resolvers.Results.update_result/3
    end
  end
end
