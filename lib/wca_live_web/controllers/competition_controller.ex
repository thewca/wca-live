defmodule WcaLiveWeb.CompetitionController do
  use WcaLiveWeb, :controller

  alias WcaLive.Competitions
  alias WcaLive.Scoretaking
  alias WcaLive.Repo

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

  def show_results(conn, params) do
    case fetch_competition_by_id_or_wca_id(params["id_or_wca_id"]) do
      {:ok, competition} ->
        results = format_results(competition)

        conn
        |> put_status(200)
        |> json(results)

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
            round
            |> Scoretaking.enter_result_attempt(result, attempt_number, attempt_result, user)
            |> case do
              {:ok, round} ->
                publish_round_update(round)

                conn
                |> put_status(200)
                |> json(%{})

              {:error, changeset} ->
                changeset_error(conn, changeset)
            end

          {:error, message} ->
            unauthorized(conn, message)
        end

      _ ->
        invalid_payload(conn)
    end
  end

  def enter_results(conn, params) do
    with %{
           "competitionWcaId" => competition_wca_id,
           "eventId" => event_id,
           "roundNumber" => round_number,
           "results" => results
         } <- params,
         true <- valid_results_payload?(results) do
      competition = Competitions.get_competition_by_wca_id!(competition_wca_id)
      round = Scoretaking.get_round_by_event_and_number!(competition.id, event_id, round_number)

      case authorize_scoretaking_token(conn, competition) do
        {:ok, user} ->
          result_attrs = results_payload_to_attrs(round, results)

          case Scoretaking.enter_results(round, result_attrs, user) do
            {:ok, round} ->
              publish_round_update(round)

              conn
              |> put_status(200)
              |> json(%{})

            {:error, changeset} ->
              changeset_error(conn, changeset)
          end

        {:error, message} ->
          unauthorized(conn, message)
      end
    else
      _ -> invalid_payload(conn)
    end
  end

  defp valid_results_payload?(results) when is_list(results) do
    Enum.all?(results, &match?(%{"registrantId" => _, "attempts" => _}, &1))
  end

  defp valid_results_payload?(_other), do: false

  defp results_payload_to_attrs(round, results) do
    round = Scoretaking.preload_results_with_person(round)
    registrant_id_to_result_id = Map.new(round.results, &{&1.person.registrant_id, &1.id})

    for result <- results do
      %{"registrantId" => registrant_id, "attempts" => attempts} = result

      id =
        registrant_id_to_result_id[registrant_id] ||
          raise Ecto.NoResultsError, queryable: Competitions.Person

      %{
        id: id,
        attempts: attempts,
        entered_at: DateTime.utc_now()
      }
    end
  end

  defp publish_round_update(round) do
    # Publish event to trigger subscription updates
    Absinthe.Subscription.publish(WcaLiveWeb.Endpoint, %{round: round}, round_updated: round.id)
  end

  defp changeset_error(conn, changeset) do
    conn
    |> put_status(422)
    |> json(%{errors: WcaLiveWeb.Helpers.changeset_to_error_messages(changeset)})
  end

  defp unauthorized(conn, message) do
    conn
    |> put_status(401)
    |> json(%{error: message})
  end

  defp invalid_payload(conn) do
    conn
    |> put_status(400)
    |> json(%{error: "invalid payload"})
  end

  defp authorize_scoretaking_token(conn, competition) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> verify_scoretaking_token(token, competition)
      [_] -> {:error, "invalid token format"}
      _ -> {:error, "no authorization token provided"}
    end
  end

  defp verify_scoretaking_token(token, competition) do
    case WcaLive.Accounts.get_user_and_competition_by_scoretaking_token(token) do
      {user, token_competition} ->
        cond do
          competition.id != token_competition.id ->
            {:error, "the provided token does not grant access to this competition"}

          not Scoretaking.Access.can_scoretake_competition?(user, competition) ->
            {:error, "the token user no longer have access to this competition"}

          true ->
            {:ok, user}
        end

      nil ->
        {:error, "the provided token is not valid"}
    end
  end

  defp fetch_competition_by_id_or_wca_id(id_or_wca_id) do
    case Integer.parse(id_or_wca_id) do
      {id, _} -> Competitions.fetch_competition(id)
      _ -> Competitions.fetch_competition_by_wca_id(id_or_wca_id)
    end
  end

  defp format_results(competition) do
    competition
    |> Repo.preload(
      competition_events: [rounds: [:competition_event, results: [:person]]],
      people: []
    )
    |> competition_to_results()
  end

  defp competition_to_results(competition) do
    result_registrant_ids =
      for competition_event <- competition.competition_events,
          round <- competition_event.rounds,
          result <- round.results,
          result.attempts != [],
          do: result.person.registrant_id,
          into: MapSet.new()

    %{
      events: Enum.map(competition.competition_events, &format_competition_event/1),
      persons:
        for person <- competition.people, person.registrant_id in result_registrant_ids do
          format_person(person)
        end
    }
  end

  defp format_competition_event(competition_event) do
    %{
      "eventId" => competition_event.event_id,
      "rounds" => Enum.map(competition_event.rounds, &format_round/1)
    }
  end

  defp format_round(round) do
    %{
      "number" => round.number,
      "results" =>
        for result <- round.results, result.attempts != [] do
          format_result(result)
        end
    }
  end

  defp format_result(result) do
    %{
      "personId" => result.person.registrant_id,
      "ranking" => result.ranking,
      "best" => result.best,
      "average" => result.average,
      "attempts" => result.attempts |> Enum.map(fn attempt -> attempt.result end)
    }
  end

  defp format_person(person) do
    %{
      "id" => person.registrant_id,
      "wcaId" => person.wca_id,
      "name" => person.name,
      "country" => person.country_iso2
    }
  end
end
