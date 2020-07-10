defmodule WcaLiveWeb.Schema.RoundTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  @desc "A round."
  object :round do
    field :id, non_null(:id)

    field :name, non_null(:string) do
      resolve &Resolvers.Rounds.round_name/3
    end

    field :label, :string do
      resolve &Resolvers.Rounds.round_label/3
    end

    field :open, non_null(:boolean) do
      resolve &Resolvers.Rounds.round_open/3
    end

    field :finished, non_null(:boolean) do
      resolve &Resolvers.Rounds.round_finished/3
    end

    field :active, non_null(:boolean) do
      resolve &Resolvers.Rounds.round_active/3
    end

    field :format, non_null(:format) do
      resolve &Resolvers.Rounds.round_format/3
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

  object :round_queries do
    field :round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Rounds.get_round/3
    end
  end

  object :round_mutations do
    field :open_round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Rounds.open_round/3
    end

    field :clear_round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Rounds.clear_round/3
    end
  end
end
