defmodule WcaLiveWeb.AuthController do
  use WcaLiveWeb, :controller

  alias WcaLive.Wca

  def authorize(conn, _params) do
    redirect(conn, external: Wca.OAuth.authorize_url("public manage_competitions"))
  end

  def callback(conn, %{"code" => code}) do
    {:ok, token} = Wca.OAuth.get_token(code)
    {:ok, data} = Wca.Api.get_me(token.access_token)
    IO.inspect(data)
    redirect(conn, to: "/")
  end
end
