defmodule WcaLiveWeb.CompetitionController do
  use WcaLiveWeb, :controller

  alias WcaLive.Competitions

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
end
