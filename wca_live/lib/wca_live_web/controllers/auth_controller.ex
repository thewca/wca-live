defmodule WcaLiveWeb.AuthController do
  use WcaLiveWeb, :controller

  alias WcaLive.Wca
  alias WcaLive.Accounts

  def authorize(conn, _params) do
    url = Wca.OAuth.authorize_url("public manage_competitions")
    redirect(conn, external: url)
  end

  def callback(conn, %{"code" => code}) do
    {:ok, token_attrs} = Wca.OAuth.get_token(code)
    {:ok, data} = Wca.Api.get_me(token_attrs.access_token)
    user_attrs = json_to_user_attrs(data)

    {:ok, user} = Accounts.import_user(user_attrs, token_attrs)

    conn
    |> put_session(:user_id, user.id)
    |> redirect(to: "/")
  end

  defp json_to_user_attrs(%{"me" => me}) do
    %{
      wca_user_id: me["id"],
      wca_id: me["wca_id"],
      name: me["name"],
      avatar_url: me["avatar"]["url"],
      avatar_thumb_url: me["avatar"]["thumb_url"]
    }
  end
end
