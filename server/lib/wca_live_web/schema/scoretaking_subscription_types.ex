defmodule WcaLiveWeb.Schema.ScoretakingSubscriptionTypes do
  use Absinthe.Schema.Notation

  object :scoretaking_subscriptions do
    field :round_updated, non_null(:round) do
      arg :id, non_null(:id)

      config fn args, _resolution ->
        # Setting a constant `context_id` means that
        # if multiple users request the same subscription data,
        # Absinthe runs the document only once and sends the data to all of the users.
        {:ok, topic: args.id, context_id: "global"}
      end

      trigger :enter_result_attempts,
        topic: fn
          %{result: result} -> result && result.round_id
        end

      trigger :add_person_to_round,
        topic: fn
          %{round: round} -> round && round.id
        end

      trigger :remove_person_from_round,
        topic: fn
          %{round: round} -> round && round.id
        end

      resolve fn
        %{round: round}, _, _ ->
          {:ok, round}

        %{result: result}, _, _ ->
          round = WcaLive.Scoretaking.get_round!(result.round_id)
          round = WcaLive.Scoretaking.preload_results(round)
          {:ok, round}
      end
    end
  end
end
