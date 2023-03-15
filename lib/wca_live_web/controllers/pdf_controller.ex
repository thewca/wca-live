defmodule WcaLiveWeb.PdfController do
  use WcaLiveWeb, :controller

  import Ecto.Query

  alias WcaLive.Scoretaking
  alias WcaLive.Scoretaking.Result
  alias WcaLive.Wca

  def round(conn, %{"id" => id}) do
    round =
      Scoretaking.get_round!(id,
        results: Result |> Result.order_by_ranking() |> preload([:person]),
        competition_event: :competition
      )

    event = Wca.Event.get_by_id!(round.competition_event.event_id)
    format = Wca.Format.get_by_id!(round.format_id)
    stats = Result.ordered_result_stats(event.id, format)

    conn
    |> render("round.pdf", round: round, event: event, format: format, stats: stats)
  end
end
