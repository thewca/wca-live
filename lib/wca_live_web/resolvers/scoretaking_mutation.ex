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
      {:ok, %{round: round}}
    end
  end

  def open_round(_parent, _args, _resolution), do: @not_authenticated

  def clear_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, round} <- Scoretaking.fetch_round(input.id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.clear_round(round) do
      {:ok, %{round: round}}
    end
  end

  def clear_round(_parent, _args, _resolution), do: @not_authenticated

  def add_person_to_round(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    with {:ok, round} <- Scoretaking.fetch_round(input.round_id),
         {:ok, person} <- Competitions.fetch_person(input.person_id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.add_person_to_round(person, round) do
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
      {:ok, %{round: round}}
    end
  end

  def remove_person_from_round(_parent, _args, _resolution), do: @not_authenticated

  def remove_no_shows_from_round(_parent, %{input: input}, %{
        context: %{current_user: current_user}
      }) do
    person_ids = Enum.map(input.person_ids, &String.to_integer/1)

    with {:ok, round} <- Scoretaking.fetch_round(input.round_id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.remove_no_shows_from_round(round, person_ids) do
      {:ok, %{round: round}}
    end
  end

  def remove_no_shows_from_round(_parent, _args, _resolution), do: @not_authenticated

  # Results

  def enter_results(_parent, %{input: input}, %{context: %{current_user: current_user}}) do
    result_inputs =
      for input <- input.results,
          do: %{
            id: String.to_integer(input.id),
            attempts: input.attempts,
            entered_at: input.entered_at
          }

    with {:ok, round} <- Scoretaking.fetch_round(input.id),
         true <- Scoretaking.Access.can_manage_round?(current_user, round) || @access_denied,
         {:ok, round} <- Scoretaking.enter_results(round, result_inputs, current_user) do
      {:ok, %{round: round}}
    end
  end

  def enter_results(_parent, _args, _resolution), do: @not_authenticated
end
