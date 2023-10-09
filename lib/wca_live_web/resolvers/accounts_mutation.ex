defmodule WcaLiveWeb.Resolvers.AccountsMutation do
  alias WcaLive.Accounts
  alias WcaLive.Competitions

  def generate_one_time_code(_parent, _args, %{context: %{current_user: current_user}}) do
    with {:ok, otc} <- Accounts.generate_one_time_code(current_user) do
      {:ok, %{one_time_code: otc}}
    end
  end

  def generate_one_time_code(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def generate_scoretaking_token(_parent, %{input: input}, %{
        context: %{current_user: current_user}
      }) do
    competition = Competitions.get_competition(input.competition_id)

    can_scoretake? =
      WcaLive.Scoretaking.Access.can_scoretake_competition?(current_user, competition)

    if can_scoretake? do
      scoretaking_token = Accounts.generate_scoretaking_token(current_user, competition)
      {:ok, %{token: scoretaking_token.token, scoretaking_token: scoretaking_token}}
    else
      {:error, "you do not have scoretaking access for this competition"}
    end
  end

  def generate_scoretaking_token(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def delete_scoretaking_token(_parent, %{input: input}, %{
        context: %{current_user: current_user}
      }) do
    scoretaking_token = Accounts.get_scoretaking_token!(input.id)

    if scoretaking_token.user_id == current_user.id do
      Accounts.delete_scoretaking_token(scoretaking_token)
      {:ok, %{scoretaking_token: scoretaking_token}}
    else
      {:error, "not authorized"}
    end
  end

  def delete_scoretaking_token(_parent, _args, _resolution), do: {:error, "not authenticated"}
end
