defmodule WcaLiveWeb.UserAuth do
  @moduledoc """
  Functions related to user authentication and tokens.
  """

  import Plug.Conn

  alias WcaLive.Accounts

  # Make the remember me cookie valid for 1 day. If you want to bump
  # or reduce this value, also change the token expiry itself in UserToken
  @max_age 60 * 60 * 24 * 1
  @remember_me_cookie "_wca_live_web_user_remember_me"
  @remember_me_options [sign: true, max_age: @max_age, same_site: "Lax"]

  @doc """
  Logs the user in.

  Note that this does not finish the request, so you need to redirect
  or return a response after calling this function.
  """
  def sign_in_user(conn, user) do
    token = Accounts.generate_user_session_token(user)

    conn
    |> renew_session()
    |> put_token_in_session(token)
    |> write_remember_me_cookie(token)
  end

  defp write_remember_me_cookie(conn, token) do
    put_resp_cookie(conn, @remember_me_cookie, token, @remember_me_options)
  end

  defp renew_session(conn) do
    conn
    |> configure_session(renew: true)
    |> clear_session()
  end

  @doc """
  A plug that authenticates the user by looking into the session and
  persistent session cookie.
  """
  def fetch_current_user(conn, _opts) do
    {user_token, conn} = ensure_user_token(conn)
    user = user_token && WcaLive.Accounts.get_user_by_session_token(user_token)
    assign(conn, :current_user, user)
  end

  defp ensure_user_token(conn) do
    if token = get_session(conn, :user_token) do
      {token, conn}
    else
      # Phoenix session is cleared when the browser closes, we use
      # a separate cookie to persist the token for longer
      conn = fetch_cookies(conn, signed: [@remember_me_cookie])

      if token = conn.cookies[@remember_me_cookie] do
        {token, put_token_in_session(conn, token)}
      else
        {nil, conn}
      end
    end
  end

  defp put_token_in_session(conn, token) do
    put_session(conn, :user_token, token)
  end

  @doc """
  Logs the user out.

  It clears all session data for safety.

  Note that this does not finish the request, so you need to redirect
  or return a response after calling this function.
  """
  def sign_out_user(conn) do
    if user_token = get_session(conn, :user_token) do
      user_token && Accounts.delete_user_session_token(user_token)
    end

    conn
    |> renew_session()
    |> delete_resp_cookie(@remember_me_cookie)
  end
end
