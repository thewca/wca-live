defmodule WcaLiveWeb.Schema.ScoretakingTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  object :scoretaking_queries do
    field :round, :round do
      arg :id, non_null(:id)
      resolve &Resolvers.Scoretaking.get_round/3
    end

    field :recent_records, non_null(list_of(non_null(:record))) do
      resolve &Resolvers.Scoretaking.list_recent_records/3
    end

    field :official_world_records, non_null(list_of(non_null(:official_record))) do
      resolve &Resolvers.Scoretaking.official_world_records/3
    end
  end

  @desc "A round."
  object :round do
    field :id, non_null(:id)

    field :number, non_null(:integer)

    field :name, non_null(:string) do
      resolve &Resolvers.Scoretaking.round_name/3
    end

    field :label, :string do
      resolve with_round_results(&Resolvers.Scoretaking.round_label/3)
    end

    field :open, non_null(:boolean) do
      resolve with_round_results(&Resolvers.Scoretaking.round_open/3)
    end

    field :finished, non_null(:boolean) do
      resolve with_round_results(&Resolvers.Scoretaking.round_finished/3)
    end

    field :active, non_null(:boolean) do
      resolve with_round_results(&Resolvers.Scoretaking.round_active/3)
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

    @desc "Results ordered by ranking and person name."
    field :results, non_null(list_of(non_null(:result))) do
      resolve dataloader(:db)

      complexity fn _args, child_complexity ->
        50 * child_complexity
      end
    end

    @desc "People who would qualify to this round, if one person quit."
    field :next_qualifying, non_null(list_of(non_null(:person))) do
      resolve &Resolvers.Scoretaking.round_next_qualifying/3
    end

    @desc "Describes qualifying people who could be manually added to this round."
    field :advancement_candidates, non_null(:advancement_candidates) do
      resolve &Resolvers.Scoretaking.round_advancement_candidates/3
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
    field :cumulative_round_wcif_ids, non_null(list_of(non_null(:string)))
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

    field :entered_at, :datetime
  end

  @desc "A single attempt done by a competitor."
  object :attempt do
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

  @desc "A structure describing which people can be added to the given round."
  object :advancement_candidates do
    @desc "People who qualify to this round, but are not in it."
    field :qualifying, non_null(list_of(non_null(:person)))

    @desc "People who would be removed from this round if one of the other qualifying people was added. " <>
            "If this list is not empty, it means the qualifying people have quit before, " <>
            "and thus may supersede whoever replaced them."
    field :revocable, non_null(list_of(non_null(:person)))
  end

  @desc "Official regional record from the WCA rankings."
  object :official_record do
    field :event, non_null(:event) do
      resolve &Resolvers.Scoretaking.record_event/3
    end

    field :type, non_null(:string)
    field :attempt_result, non_null(:integer)
  end

  # Helpers

  # Loads round results with dataloader before calling the resolver function
  defp with_round_results(fun) do
    fn round, args, resolution ->
      dataloader_fun =
        dataloader(:db, :results,
          callback: fn results, round, _args ->
            round = put_in(round.results, results)
            fun.(round, args, resolution)
          end
        )

      dataloader_fun.(round, args, resolution)
    end
  end
end
