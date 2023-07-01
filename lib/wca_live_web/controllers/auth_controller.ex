defmodule WcaLiveWeb.AuthController do
  use WcaLiveWeb, :controller

  alias WcaLive.Wca
  alias WcaLive.Accounts
  alias WcaLiveWeb.UserAuth

  def authorize(conn, _params) do
    url = Wca.OAuth.authorize_url("public manage_competitions email")
    redirect(conn, external: url)
  end

  def callback(conn, params) do
    with %{"code" => code} <- params,
         {:ok, token_attrs} <- Wca.OAuth.get_token(code),
         {:ok, data} <- Wca.Api.impl().get_me(token_attrs.access_token),
         user_attrs <- Accounts.User.wca_json_to_attrs(data["me"]),
         {:ok, user} <- Accounts.import_user(user_attrs, token_attrs) do
      conn
      |> UserAuth.sign_in_user(user)
      |> redirect_to_app(to: "/")
    else
      _ -> redirect_to_app(conn, to: "/")
    end
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
end
