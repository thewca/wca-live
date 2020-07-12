defmodule WcaLiveWeb.Schema.ScoretakingTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A round."
  object :round do
    field :id, non_null(:id)

    field :name, non_null(:string) do
      resolve &Resolvers.Scoretaking.round_name/3
    end

    field :label, :string do
      resolve &Resolvers.Scoretaking.round_label/3
    end

    field :open, non_null(:boolean) do
      resolve &Resolvers.Scoretaking.round_open/3
    end

    field :finished, non_null(:boolean) do
      resolve &Resolvers.Scoretaking.round_finished/3
    end

    field :active, non_null(:boolean) do
      resolve &Resolvers.Scoretaking.round_active/3
    end

    field :format, non_null(:format) do
      resolve &Resolvers.Scoretaking.round_format/3
    end

    field :advancement_condition, :advancement_condition
    field :time_limit, :time_limit
    field :cutoff, :cutoff

    field :competition_event, non_null(:competition_event) do
      resolve dataloader(:db)
    end

    field :results, non_null(list_of(non_null(:result))) do
      resolve dataloader(:db)
    end
  end

  object :format do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :short_name, non_null(:string)
    field :number_of_attempts, non_null(:integer)
    field :sort_by, non_null(:string)
  end

  object :time_limit do
    field :centiseconds, non_null(:integer)
    # TODO: actual rounds (?)
    field :cumulative_round_wcif_ids, non_null(list_of(non_null(:integer)))
  end

  object :cutoff do
    field :attempt_result, non_null(:integer)
    field :number_of_attempts, non_null(:integer)
  end

  object :advancement_condition do
    field :level, non_null(:integer)
    field :type, non_null(:string)
  end

  @desc "A result. Represents person's participation in a single round."
  object :result do
    field :id, non_null(:id)
    field :ranking, :integer
    field :best, :integer
    field :average, :integer
    # TODO: maybe include tags in best/average
    field :average_record_tag, :string
    field :single_record_tag, :string
    field :advancing, non_null(:boolean)

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

  @desc "A virtual object representing a regional record entered within the platform."
  object :record do
    field :id, non_null(:id)
    field :type, non_null(:string)
    field :tag, non_null(:string)
    field :attempt_result, non_null(:integer)
    field :result, non_null(:result)
  end

  input_object :result_input do
    field :attempts, non_null(list_of(non_null(:attempt_input)))
  end

  input_object :attempt_input do
    field :result, non_null(:integer)
    field :reconstruction, :string
  end

  object :scoretaking_queries do
    field :round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Scoretaking.get_round/3
    end

    field :recent_records, non_null(list_of(non_null(:record))) do
      resolve &Resolvers.Scoretaking.list_recent_records/3
    end
  end

  object :scoretaking_mutations do
    field :open_round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Scoretaking.open_round/3
    end

    field :clear_round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Scoretaking.clear_round/3
    end

    # TODO: what type to return
    field :update_result, :result do
      arg :id, non_null(:id)
      arg :input, non_null(:result_input)
      resolve &Resolvers.Scoretaking.update_result/3
    end
  end
end
