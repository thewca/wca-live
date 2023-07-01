defmodule WcaLiveWeb.CompetitionControllerTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "show_wcif" do
    @tag :signed_in
    test "returns WCIF when authorized", %{conn: conn, current_user: current_user} do
      competition = insert(:competition, wca_id: "WC2019")
      insert(:staff_member, competition: competition, user: current_user, roles: ["delegate"])

      conn = get(conn, "/api/competitions/#{competition.id}/wcif")

      body = json_response(conn, 200)
      assert %{"formatVersion" => "1.0", "id" => "WC2019"} = body
    end

    test "returns error when not signed in", %{conn: conn} do
      competition = insert(:competition, wca_id: "WC2019")

      conn = get(conn, "/api/competitions/#{competition.id}/wcif")

      body = json_response(conn, 403)
      assert body == %{"error" => "access denied"}
    end

    @tag :signed_in
    test "returns error when not authorized", %{conn: conn} do
      competition = insert(:competition, wca_id: "WC2019")

      conn = get(conn, "/api/competitions/#{competition.id}/wcif")

      body = json_response(conn, 403)
      assert body == %{"error" => "access denied"}
    end
  end
end
