defmodule WcaLiveWeb.CatchAllController do
  use WcaLiveWeb, :controller

  def catch_all(conn, _params) do
    path = Application.app_dir(:wca_live, "priv/static/index.html")
    send_file(conn, 200, path)
  end
end
