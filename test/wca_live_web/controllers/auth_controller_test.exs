defmodule WcaLiveWeb.AuthControllerTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "sign_in_by_code" do
    test "signs the user in if the given code is valid", %{conn: conn} do
      user = insert(:user)
      otc = insert(:one_time_code, user: user)

      conn = post(conn, "/auth/sign-in-by-code", %{"code" => otc.code})

      assert get_session(conn, :user_token)
      assert conn.resp_cookies["_wca_live_web_user_remember_me"]

      body = json_response(conn, 200)
      assert body == %{"status" => "ok"}
    end

    test "returns an error when the code is expired", %{conn: conn} do
      user = insert(:user)
      hour_ago = DateTime.utc_now() |> DateTime.add(-3600, :second)
      otc = insert(:one_time_code, user: user, expires_at: hour_ago)

      conn = post(conn, "/auth/sign-in-by-code", %{"code" => otc.code})

      body = json_response(conn, 200)
      assert body == %{"status" => "error", "message" => "code expired"}
    end

    test "returns an error when the code is invalid", %{conn: conn} do
      conn = post(conn, "/auth/sign-in-by-code", %{"code" => "invalid"})

      body = json_response(conn, 200)
      assert body == %{"status" => "error", "message" => "invalid code"}
    end
  end

  describe "sign_out" do
    @tag :signed_in
    test "signs the user out", %{conn: conn} do
      conn = delete(conn, "/auth/sign-out")

      body = json_response(conn, 200)
      assert body == %{"status" => "ok"}
    end

    test "succeeds even if the user is not logged in", %{conn: conn} do
      conn = delete(conn, "/auth/sign-out")

      body = json_response(conn, 200)
      assert body == %{"status" => "ok"}
    end
  end
end
