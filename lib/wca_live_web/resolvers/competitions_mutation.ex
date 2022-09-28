defmodule WcaLiveWeb.Resolvers.CompetitionsMutation do
  alias WcaLive.Competitions

  def update_competition_access(_parent, %{input: input}, %{
        context: %{current_user: current_user}
      }) do
    with {:ok, competition} <- Competitions.fetch_competition(input.id),
         true <-
           Competitions.Access.can_manage_competition?(current_user, competition) ||
             {:error, "access denied"},
         {:ok, competition} <- Competitions.update_competition(competition, input) do
      {:ok, %{competition: competition}}
    end
  end

  def update_competition_access(_parent, _args, _resolution), do: {:error, "not authenticated"}
end
