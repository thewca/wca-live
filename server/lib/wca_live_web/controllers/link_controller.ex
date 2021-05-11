defmodule WcaLiveWeb.LinkController do
  use WcaLiveWeb, :controller

  alias WcaLive.{Competitions, Scoretaking}

  def competition(conn, %{"wca_id" => wca_id}) do
    competition = Competitions.get_competition_by_wca_id!(wca_id)
    redirect(conn, to: "/competitions/#{competition.id}")
  end

  def round(conn, %{"wca_id" => wca_id, "event_id" => event_id, "round_number" => round_number}) do
    competition = Competitions.get_competition_by_wca_id!(wca_id)

    round =
      Scoretaking.get_round_by_event_and_number!(
        competition.id,
        event_id,
        String.to_integer(round_number)
      )

    redirect(conn, to: "/competitions/#{competition.id}/rounds/#{round.id}")
  end
end
