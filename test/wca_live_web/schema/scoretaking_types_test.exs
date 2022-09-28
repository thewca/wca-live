defmodule WcaLiveWeb.Schema.ScoretakingTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "query: get round" do
    @round_query """
    query Round($id: ID!) {
      round(id: $id) {
        id
        number
      }
    }
    """

    test "returns a round with matching id", %{conn: conn} do
      round = insert(:round)

      variables = %{"id" => to_gql_id(round.id)}

      conn = post(conn, "/api", %{"query" => @round_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "round" => %{
                   "id" => to_gql_id(round.id),
                   "number" => round.number
                 }
               }
             } == body
    end

    test "returns null if there is no round with matching id", %{conn: conn} do
      variables = %{"id" => "1"}

      conn = post(conn, "/api", %{"query" => @round_query, "variables" => variables})

      body = json_response(conn, 200)
      assert %{"data" => %{"round" => nil}} == body
    end
  end

  describe "query: round attributes" do
    @round_query """
    query Round($id: ID!) {
      round(id: $id) {
        id
        number
        name
        label
        open
        finished
        active
        format {
          id
          shortName
          numberOfAttempts
          sortBy
        }
        advancementCondition {
          type
          level
        }
        timeLimit {
          centiseconds
          cumulativeRoundWcifIds
        }
        cutoff {
          numberOfAttempts
          attemptResult
        }
        competitionEvent {
          id
          event {
            id
          }
        }
        results {
          id
        }
        nextQualifying {
          id
        }
        advancementCandidates {
          qualifying {
            id
          }
          revocable {
            id
          }
        }
      }
    }
    """

    test "resolves fields with no errors", %{conn: conn} do
      round = insert(:round)

      variables = %{"id" => to_gql_id(round.id)}

      conn = post(conn, "/api", %{"query" => @round_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{"data" => %{"round" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end
  end

  describe "query: round results" do
    @round_with_results_query """
    query Round($id: ID!) {
      round(id: $id) {
        id
        results {
          id
          ranking
        }
      }
    }
    """

    test "includes results sorted by ranking then competitor name", %{conn: conn} do
      round = insert(:round)

      result1 =
        insert(:result, round: round, ranking: 1, person: build(:person, name: "Severus Snape"))

      result4 =
        insert(:result, round: round, ranking: 4, person: build(:person, name: "Ron Weasley"))

      result3 =
        insert(:result, round: round, ranking: 2, person: build(:person, name: "Hermione Granger"))

      result2 =
        insert(:result, round: round, ranking: 2, person: build(:person, name: "Harry Potter"))

      variables = %{"id" => to_gql_id(round.id)}

      conn = post(conn, "/api", %{"query" => @round_with_results_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "round" => %{
                   "id" => to_gql_id(round.id),
                   "results" => [
                     %{"id" => to_gql_id(result1.id), "ranking" => 1},
                     %{"id" => to_gql_id(result2.id), "ranking" => 2},
                     %{"id" => to_gql_id(result3.id), "ranking" => 2},
                     %{"id" => to_gql_id(result4.id), "ranking" => 4}
                   ]
                 }
               }
             } == body
    end
  end

  describe "query: recent records" do
    @recent_records_query """
    query RecentRecords {
      recentRecords {
        type
        tag
        attemptResult
        result {
          id
        }
      }
    }
    """

    test "returns a list of unique records from last 10 days sorted by significance", %{
      conn: conn
    } do
      wr333 =
        insert_result_x_days_ago(
          5,
          "333",
          single_record_tag: "WR",
          average_record_tag: nil,
          best: 300,
          average: 550
        )

      _worse_wr333 =
        insert_result_x_days_ago(
          5,
          "333",
          single_record_tag: "WR",
          average_record_tag: nil,
          best: 310,
          average: 550
        )

      _old_wr333 =
        insert_result_x_days_ago(
          11,
          "333",
          single_record_tag: "WR",
          average_record_tag: nil,
          best: 320,
          average: 570
        )

      wr444 =
        insert_result_x_days_ago(
          7,
          "444",
          single_record_tag: "WR",
          average_record_tag: nil,
          best: 1500,
          average: 2100
        )

      cr333 =
        insert_result_x_days_ago(
          10,
          "333",
          single_record_tag: "NR",
          average_record_tag: "CR",
          best: 544,
          average: 598
        )

      conn = post(conn, "/api", %{"query" => @recent_records_query})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "recentRecords" => [
                   %{
                     "type" => "single",
                     "tag" => "WR",
                     "attemptResult" => wr333.best,
                     "result" => %{"id" => to_gql_id(wr333.id)}
                   },
                   %{
                     "type" => "single",
                     "tag" => "WR",
                     "attemptResult" => wr444.best,
                     "result" => %{"id" => to_gql_id(wr444.id)}
                   },
                   %{
                     "type" => "average",
                     "tag" => "CR",
                     "attemptResult" => cr333.average,
                     "result" => %{"id" => to_gql_id(cr333.id)}
                   },
                   %{
                     "type" => "single",
                     "tag" => "NR",
                     "attemptResult" => cr333.best,
                     "result" => %{"id" => to_gql_id(cr333.id)}
                   }
                 ]
               }
             } == body
    end
  end

  defp insert_result_x_days_ago(days, event_id, attrs) do
    x_days_ago = Date.utc_today() |> Date.add(-days)

    competition = insert(:competition, start_date: x_days_ago, end_date: x_days_ago)
    competition_event = insert(:competition_event, competition: competition, event_id: event_id)
    round = insert(:round, competition_event: competition_event)
    insert(:result, [{:round, round} | attrs])
  end
end
