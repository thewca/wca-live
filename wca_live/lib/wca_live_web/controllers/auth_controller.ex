defmodule WcaLiveWeb.AuthController do
  use WcaLiveWeb, :controller

  alias WcaLive.Wca
  alias WcaLive.Accounts

  def authorize(conn, _params) do
    url = Wca.OAuth.authorize_url("public manage_competitions")
    redirect(conn, external: url)
  end

  def callback(conn, %{"code" => code}) do
    with {:ok, token_attrs} <- Wca.OAuth.get_token(code),
         {:ok, data} <- Wca.Api.get_me(token_attrs.access_token),
         user_attrs <- Accounts.User.wca_json_to_attrs(data["me"]),
         {:ok, user} <- Accounts.import_user(user_attrs, token_attrs) do
      conn
      |> put_session(:user_id, user.id)
      |> redirect(to: "/")
    end
  end
end
