defmodule WcaLiveWeb.Resolvers.ScoretakingMutation do
  alias WcaLive.Scoretaking
  alias WcaLive.Competitions

  @access_denied {:error, "access denied"}
  @not_authenticated {:error, "not authenticated"}

  # Rounds

  def open_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, round} <- Scoretaking.fetch_round(input.id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.open_round(round) do
      round = Scoretaking.preload_results(round)
      {:ok, %{round: round}}
    end
  end

  def open_round(_parent, _args, _resolution), do: @not_authenticated

  def clear_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, round} <- Scoretaking.fetch_round(input.id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.clear_round(round) do
      round = Scoretaking.preload_results(round)
      {:ok, %{round: round}}
    end
  end

  def clear_round(_parent, _args, _resolution), do: @not_authenticated

  def add_person_to_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, round} <- Scoretaking.fetch_round(input.round_id),
         {:ok, person} <- Competitions.fetch_person(input.person_id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.add_person_to_round(person, round) do
      round = Scoretaking.preload_results(round)
      {:ok, %{round: round}}
    end
  end

  def add_person_to_round(_parent, _args, _resolution), do: @not_authenticated

  def remove_person_from_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, round} <- Scoretaking.fetch_round(input.round_id),
         {:ok, person} <- Competitions.fetch_person(input.person_id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <-
           Scoretaking.remove_person_from_round(person, round, replace: input.replace) do
      round = Scoretaking.preload_results(round)
      {:ok, %{round: round}}
    end
  end

  def remove_person_from_round(_parent, _args, _resolution), do: @not_authenticated

  # Results

  def enter_result_attempts(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, result} <- Scoretaking.fetch_result(input.id),
         true <- Scoretaking.Access.can_manage_result?(current_user, result) || @access_denied,
         {:ok, result} <-
           Scoretaking.enter_result_attempts(result, input.attempts, current_user) do
      {:ok, %{result: result}}
    end
  end

  def enter_result_attempts(_parent, _args, _resolution), do: @not_authenticated
end
