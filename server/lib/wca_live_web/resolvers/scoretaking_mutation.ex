defmodule WcaLiveWeb.Resolvers.ScoretakingMutation do
  alias WcaLive.Scoretaking
  alias WcaLive.Competitions

  # Rounds

  def open_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    round = Scoretaking.get_round!(input.id)

    if Scoretaking.Access.can_manage_round?(current_user, round) do
      with {:ok, round} <- Scoretaking.open_round(round) do
        round = Scoretaking.preload_results(round)
        {:ok, %{round: round}}
      end
    else
      {:error, "access denied"}
    end
  end

  def open_round(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def clear_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    round = Scoretaking.get_round!(input.id)

    if Scoretaking.Access.can_manage_round?(current_user, round) do
      with {:ok, round} <- Scoretaking.clear_round(round) do
        round = Scoretaking.preload_results(round)
        {:ok, %{round: round}}
      end
    else
      {:error, "access denied"}
    end
  end

  def clear_round(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def add_person_to_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    round = Scoretaking.get_round!(input.round_id)
    person = Competitions.get_person!(input.person_id)

    if Scoretaking.Access.can_manage_round?(current_user, round) do
      with {:ok, round} <- Scoretaking.add_person_to_round(person, round) do
        round = Scoretaking.preload_results(round)
        {:ok, %{round: round}}
      end
    else
      {:error, "access denied"}
    end
  end

  def add_person_to_round(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def remove_person_from_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    round = Scoretaking.get_round!(input.round_id)
    person = Competitions.get_person!(input.person_id)

    if Scoretaking.Access.can_manage_round?(current_user, round) do
      with {:ok, round} <- Scoretaking.remove_person_from_round(person, round, input.replace) do
        round = Scoretaking.preload_results(round)
        {:ok, %{round: round}}
      end
    else
      {:error, "access denied"}
    end
  end

  def remove_person_from_round(_parent, _args, _resolution), do: {:error, "not authenticated"}

  # Results

  def enter_result_attempts(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    result = Scoretaking.get_result!(input.id)

    if Scoretaking.Access.can_manage_result?(current_user, result) do
      with {:ok, result} <- Scoretaking.enter_result_attempts(result, input.attempts, current_user) do
        {:ok, %{result: result}}
      end
    else
      {:error, "access denied"}
    end
  end

  def enter_result_attempts(_parent, _args, _resolution), do: {:error, "not authenticated"}
end
