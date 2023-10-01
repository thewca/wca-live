defmodule WcaLiveWeb.CompetitionController do
  use WcaLiveWeb, :controller

  alias WcaLive.{Competitions, Scoretaking}

  def show_wcif(conn, params) do
    case Competitions.fetch_competition(params["id"]) do
      {:ok, competition} ->
        if conn.assigns.current_user &&
             Competitions.Access.can_manage_competition?(conn.assigns.current_user, competition) do
          wcif = WcaLive.Synchronization.Export.export_competition(competition)

          conn
          |> put_status(200)
          |> json(wcif)
        else
          conn
          |> put_status(403)
          |> json(%{error: "access denied"})
        end

      {:error, _} ->
        conn
        |> put_status(404)
        |> json(%{error: "not found"})
    end
  end

  def enter_attempt(conn, params) do
    case params do
      %{
        "competitionWcaId" => competition_wca_id,
        "eventId" => event_id,
        "roundNumber" => round_number,
        "registrantId" => registrant_id,
        "attemptNumber" => attempt_number,
        "attemptResult" => attempt_result
      } ->
        competition = Competitions.get_competition_by_wca_id!(competition_wca_id)
        round = Scoretaking.get_round_by_event_and_number!(competition.id, event_id, round_number)
        result = Scoretaking.get_result_by_registrant_id!(round.id, registrant_id)

        case authorize_scoretaking_token(conn, competition) do
          {:ok, user} ->
            case Scoretaking.enter_result_attempt(
                   round,
                   result,
                   attempt_number,
                   attempt_result,
                   user
                 ) do
              {:ok, round} ->
                # Publish event to trigger subscription updates
                Absinthe.Subscription.publish(WcaLiveWeb.Endpoint, %{round: round},
                  round_updated: round.id
                )

                conn
                |> put_status(200)
                |> json(%{})

              {:error, changeset} ->
                conn
                |> put_status(422)
                |> json(%{errors: WcaLiveWeb.Helpers.changeset_to_error_messages(changeset)})
            end

          {:error, message} ->
            conn
            |> put_status(401)
            |> json(%{error: message})
        end

      _ ->
        conn
        |> put_status(400)
        |> json(%{error: "invalid payload"})
    end
  end

  defp authorize_scoretaking_token(conn, competition) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] ->
        case WcaLive.Accounts.get_user_and_competition_by_scoretaking_token(token) do
          {user, token_competition} ->
            cond do
              competition.id != token_competition.id ->
                {:error, "the provided token does not grant access to this competition"}

              not WcaLive.Scoretaking.Access.can_scoretake_competition?(user, competition) ->
                {:error, "the token user no longer have access to this competition"}

              true ->
                {:ok, user}
            end

          nil ->
            {:error, "the provided token is not valid"}
        end

      [_] ->
        {:error, "invalid token format"}

      _ ->
        {:error, "no authorization token provided"}
    end
  end
end
