defmodule WcaLiveWeb.AuthController do
  use WcaLiveWeb, :controller

  alias WcaLive.Wca
  alias WcaLive.Accounts
  alias WcaLiveWeb.UserAuth

  def authorize(conn, _params) do
    url = Wca.OAuth.authorize_url("public manage_competitions email")
    redirect(conn, external: url)
  end

  def callback(conn, %{"code" => code}) do
    {:ok, token_attrs} = Wca.OAuth.get_token(code)
    {:ok, data} = Wca.Api.impl().get_me(token_attrs.access_token)

    wca_user_id = data["me"]["id"]

    {:ok, roles_data} =
      Wca.Api.impl().get_active_team_roles(wca_user_id, token_attrs.access_token)

    user_attrs = wca_json_to_user_attrs(data["me"], roles_data)
    {:ok, user} = Accounts.import_user(user_attrs, token_attrs)

    conn
    |> UserAuth.sign_in_user(user)
    |> redirect_to_app(to: "/")
  end

  def sign_in_by_code(conn, params) do
    case Accounts.authenticate_by_code(params["code"]) do
      {:ok, user} ->
        conn
        |> UserAuth.sign_in_user(user)
        |> json(%{status: :ok})

      {:error, message} ->
        json(conn, %{status: :error, message: message})
    end
  end

  def sign_out(conn, _params) do
    conn
    |> UserAuth.sign_out_user()
    |> json(%{status: :ok})
  end

  # Improve developer experience by redirecting to the client host in development.
  if Mix.env() == :prod do
    defp redirect_to_app(conn, to: path), do: redirect(conn, to: path)
  else
    defp redirect_to_app(conn, to: path),
      do: redirect(conn, external: "http://localhost:3000" <> path)
  end

  defp wca_json_to_user_attrs(json, roles_json) do
    %{
      email: json["email"],
      wca_user_id: json["id"],
      name: json["name"],
      wca_id: json["wca_id"],
      country_iso2: json["country_iso2"],
      avatar_url: json["avatar"]["url"],
      avatar_thumb_url: json["avatar"]["thumb_url"],
      wca_teams:
        roles_json
        |> get_in([Access.all(), "group", "metadata", "friendly_id"])
        |> Enum.map(&String.downcase/1)
        |> Enum.uniq()
    }
  end
end
