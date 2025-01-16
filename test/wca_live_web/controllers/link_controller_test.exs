defmodule WcaLiveWeb.LinkControllerTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "competition" do
    test "redirects by wca id", %{conn: conn} do
      competition = insert(:competition)

      conn = get(conn, "/link/competitions/#{competition.wca_id}")

      assert redirected_to(conn) == "/competitions/#{competition.id}"
    end

    test "responds with error when no competition is found", %{conn: conn} do
      assert_error_sent 404, fn ->
        get(conn, "/link/competitions/NONEXISTENT")
      end
    end
  end

  describe "round" do
    test "redirects by event and round number", %{conn: conn} do
      competition = insert(:competition)
      competition_event = insert(:competition_event, competition: competition, event_id: "333")
      round = insert(:round, competition_event: competition_event, number: 1)

      conn = get(conn, "/link/competitions/#{competition.wca_id}/rounds/333/1")

      assert redirected_to(conn) == "/competitions/#{competition.id}/rounds/#{round.id}"
    end

    test "responds with error when no round is found", %{conn: conn} do
      competition = insert(:competition)

      assert_error_sent 404, fn ->
        get(conn, "/link/competitions/#{competition.wca_id}/rounds/333/1")
      end
    end
  end

  describe "competitor" do
    test "redirects by registrant id", %{conn: conn} do
      competition = insert(:competition)
      person = insert(:person, competition: competition, registrant_id: 1)

      conn = get(conn, "/link/competitions/#{competition.wca_id}/competitors/1")

      assert redirected_to(conn) == "/competitions/#{competition.id}/competitors/#{person.id}"
    end

    test "redirects by wca id", %{conn: conn} do
      competition = insert(:competition)
      person = insert(:person, competition: competition, wca_id: "2020OTHR01")

      conn = get(conn, "/link/competitions/#{competition.wca_id}/competitors/2020OTHR01")

      assert redirected_to(conn) == "/competitions/#{competition.id}/competitors/#{person.id}"
    end

    test "responds with error when no person is found", %{conn: conn} do
      competition = insert(:competition)

      assert_error_sent 404, fn ->
        get(conn, "/link/competitions/#{competition.wca_id}/competitors/1")
      end

      assert_error_sent 404, fn ->
        get(conn, "/link/competitions/#{competition.wca_id}/competitors/2020OTHR01")
      end
    end
  end
end
