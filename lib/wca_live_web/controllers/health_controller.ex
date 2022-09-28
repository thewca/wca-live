defmodule WcaLiveWeb.HealthController do
  use WcaLiveWeb, :controller

  def index(conn, _params) do
    conn
    |> put_resp_header("access-control-allow-origin", "*")
    |> json(%{
      "application" => "wca-live"
    })
  end
end
