defmodule WcaLiveWeb.UserAuthTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  alias WcaLive.Accounts
  alias WcaLiveWeb.UserAuth

  @remember_me_cookie "_wca_live_web_user_remember_me"

  setup %{conn: conn} do
    conn =
      conn
      |> Map.replace!(:secret_key_base, WcaLiveWeb.Endpoint.config(:secret_key_base))
      |> init_test_session(%{})

    %{conn: conn}
  end

  describe "sign_in_user/2" do
    test "stores the user token in the session", %{conn: conn} do
      user = insert(:user)
      conn = UserAuth.sign_in_user(conn, user)
      assert token = get_session(conn, :user_token)
      assert Accounts.get_user_by_session_token(token)
    end

    test "clears everything previously stored in the session", %{conn: conn} do
      user = insert(:user)
      conn = conn |> put_session(:to_be_removed, "value") |> UserAuth.sign_in_user(user)
      refute get_session(conn, :to_be_removed)
    end

    test "writes the remember me cookie", %{conn: conn} do
      user = insert(:user)
      conn = conn |> fetch_cookies() |> UserAuth.sign_in_user(user)
      assert get_session(conn, :user_token) == conn.cookies[@remember_me_cookie]

      assert %{value: signed_token, max_age: max_age} = conn.resp_cookies[@remember_me_cookie]
      assert signed_token != get_session(conn, :user_token)
      assert max_age == 86_400
    end
  end

  describe "sign_out_user/1" do
    test "erases session and cookies", %{conn: conn} do
      user = insert(:user)
      user_token = Accounts.generate_user_session_token(user)

      conn =
        conn
        |> put_session(:user_token, user_token)
        |> put_req_cookie(@remember_me_cookie, user_token)
        |> fetch_cookies()
        |> UserAuth.sign_out_user()

      refute get_session(conn, :user_token)
      refute conn.cookies[@remember_me_cookie]
      assert %{max_age: 0} = conn.resp_cookies[@remember_me_cookie]
      refute Accounts.get_user_by_session_token(user_token)
    end

    test "works even if user is already signed out", %{conn: conn} do
      conn = conn |> fetch_cookies() |> UserAuth.sign_out_user()
      refute get_session(conn, :user_token)
      assert %{max_age: 0} = conn.resp_cookies[@remember_me_cookie]
    end
  end

  describe "fetch_current_user/2" do
    test "authenticates user from session", %{conn: conn} do
      user = insert(:user)
      user_token = Accounts.generate_user_session_token(user)
      conn = conn |> put_session(:user_token, user_token) |> UserAuth.fetch_current_user([])
      assert conn.assigns.current_user.id == user.id
    end

    test "authenticates user from cookies", %{conn: conn} do
      user = insert(:user)

      signed_in_conn = conn |> fetch_cookies() |> UserAuth.sign_in_user(user)

      user_token = signed_in_conn.cookies[@remember_me_cookie]
      %{value: signed_token} = signed_in_conn.resp_cookies[@remember_me_cookie]

      conn =
        conn
        |> put_req_cookie(@remember_me_cookie, signed_token)
        |> UserAuth.fetch_current_user([])

      assert conn.assigns.current_user.id == user.id
      assert get_session(conn, :user_token) == user_token
    end

    test "does not authenticate if data is missing", %{conn: conn} do
      user = insert(:user)
      Accounts.generate_user_session_token(user)
      conn = UserAuth.fetch_current_user(conn, [])
      refute get_session(conn, :user_token)
      refute conn.assigns.current_user
    end
  end
end
