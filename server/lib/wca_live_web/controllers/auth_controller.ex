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
      token = WcaLiveWeb.Auth.generate_token(user.id)

      conn
      # Return the token back to the browser in URL hash.
      |> redirect_to_app(to: "/#token=" <> token)
    end
  end

  # Improve developer experience by redirecting to the client host in development.
  if Mix.env() == :prod do
    defp redirect_to_app(conn, to: path), do: redirect(conn, to: path)
  else
    defp redirect_to_app(conn, to: path),
      do: redirect(conn, external: "http://localhost:3000" <> path)
  end
end
