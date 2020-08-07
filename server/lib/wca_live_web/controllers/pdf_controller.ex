defmodule WcaLiveWeb.PdfController do
  use WcaLiveWeb, :controller

  alias WcaLive.Scoretaking
  alias WcaLive.Wca

  def round(conn, %{"id" => id}) do
    # TODO: where should preloads go?
    round =
      Scoretaking.get_round!(id)
      |> WcaLive.Repo.preload(results: :person, competition_event: :competition)

    event = Wca.Event.get_by_id!(round.competition_event.event_id)
    format = Wca.Format.get_by_id!(round.format_id)
    stats = Scoretaking.Result.ordered_result_stats(event.id, format)

    conn
    |> render("round.pdf", round: round, event: event, format: format, stats: stats)
  end
end
