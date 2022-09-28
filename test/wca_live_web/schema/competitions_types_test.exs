defmodule WcaLiveWeb.Schema.CompetitonsTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "query: list competitions" do
    @competitions_query """
    query Competitions($limit: Int, $filter: String, $from: Date) {
      competitions(limit: $limit, filter: $filter, from: $from) {
        id
        name
      }
    }
    """

    test "given no arguments returns all competitions", %{conn: conn} do
      insert_list(3, :competition)

      conn = post(conn, "/api", %{"query" => @competitions_query})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competitions" => [
                   %{"id" => _, "name" => _},
                   %{"id" => _, "name" => _},
                   %{"id" => _, "name" => _}
                 ]
               }
             } = body
    end

    test "given filter returns a list of matching competitions", %{conn: conn} do
      # matching competitions
      insert(:competition, name: "World Championship 2019")
      # non-matching competitions
      insert(:competition, name: "Sherlock Holmes Competition 2020")
      insert(:competition, name: "Tea Party 2020")

      variables = %{"filter" => "champion"}

      conn = post(conn, "/api", %{"query" => @competitions_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competitions" => [
                   %{"id" => _, "name" => "World Championship 2019"}
                 ]
               }
             } = body
    end

    test "given from date returns a list of competitions starting from that date", %{conn: conn} do
      # matching competition
      insert(:competition, name: "Matching Competition 2020", start_date: ~D[2020-05-15])

      # non-matching competition
      insert(:competition, name: "Non-Matching Competition 2020", start_date: ~D[2020-02-15])

      variables = %{"from" => "2020-05-10"}

      conn = post(conn, "/api", %{"query" => @competitions_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competitions" => [
                   %{"id" => _, "name" => "Matching Competition 2020"}
                 ]
               }
             } = body
    end
  end

  describe "query: get competition" do
    @competition_query """
    query Competition($id: ID!) {
      competition(id: $id) {
        id
        name
      }
    }
    """

    test "returns a competition with matching id", %{conn: conn} do
      competition = insert(:competition)

      variables = %{"id" => to_gql_id(competition.id)}

      conn = post(conn, "/api", %{"query" => @competition_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "name" => competition.name
                 }
               }
             } == body
    end

    test "returns null if there is no competition with matching id", %{conn: conn} do
      variables = %{"id" => "1"}

      conn = post(conn, "/api", %{"query" => @competition_query, "variables" => variables})

      body = json_response(conn, 200)
      assert %{"data" => %{"competition" => nil}} == body
    end
  end

  describe "query: competition venues" do
    @competition_with_venues_query """
    query Competition($id: ID!) {
      competition(id: $id) {
        id
        venues {
          id
          rooms {
            id
            activities {
              id
            }
          }
        }
      }
    }
    """

    test "includes competition venues", %{conn: conn} do
      competition = insert(:competition)
      venue = insert(:venue, competition: competition)
      room = insert(:room, venue: venue)
      activity = insert(:activity, room: room)

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{"query" => @competition_with_venues_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "venues" => [
                     %{
                       "id" => to_gql_id(venue.id),
                       "rooms" => [
                         %{
                           "id" => to_gql_id(room.id),
                           "activities" => [%{"id" => to_gql_id(activity.id)}]
                         }
                       ]
                     }
                   ]
                 }
               }
             } == body
    end
  end

  describe "query: competition events" do
    @competition_with_events_query """
    query Competition($id: ID!) {
      competition(id: $id) {
        id
        competitionEvents {
          id
          rounds {
            id
          }
        }
      }
    }
    """

    test "includes competition events", %{conn: conn} do
      competition = insert(:competition)
      competition_event = insert(:competition_event, competition: competition)
      round = insert(:round, competition_event: competition_event)

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{"query" => @competition_with_events_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "competitionEvents" => [
                     %{
                       "id" => to_gql_id(competition_event.id),
                       "rounds" => [
                         %{
                           "id" => to_gql_id(round.id)
                         }
                       ]
                     }
                   ]
                 }
               }
             } == body
    end
  end

  describe "query: competition competitors" do
    @competition_with_competitors_query """
    query Competition($id: ID!) {
      competition(id: $id) {
        id
        competitors {
          id
        }
      }
    }
    """

    test "includes people with an accepted registration", %{conn: conn} do
      competition = insert(:competition)
      accepted_competitor = insert(:person, competition: competition)
      insert(:registration, person: accepted_competitor, status: "accepted")
      pending_competitor = insert(:person, competition: competition)
      insert(:registration, person: pending_competitor, status: "pending")
      deleted_competitor = insert(:person, competition: competition)
      insert(:registration, person: deleted_competitor, status: "deleted")
      _registrationless_competitor = insert(:person, competition: competition)

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{
          "query" => @competition_with_competitors_query,
          "variables" => variables
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "competitors" => [
                     %{
                       "id" => to_gql_id(accepted_competitor.id)
                     }
                   ]
                 }
               }
             } == body
    end
  end

  describe "query: competition access" do
    @competition_with_access_query """
    query Competition($id: ID!) {
      competition(id: $id) {
        id
        access {
          canManage
          canScoretake
        }
      }
    }
    """

    test "returns no access rights for an unauthenticated user", %{conn: conn} do
      competition = insert(:competition)

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{
          "query" => @competition_with_access_query,
          "variables" => variables
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "access" => %{
                     "canManage" => false,
                     "canScoretake" => false
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "returns full access rights for a competition manager", %{
      conn: conn,
      current_user: current_user
    } do
      competition = insert(:competition)
      insert(:staff_member, competition: competition, user: current_user, roles: ["delegate"])

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{
          "query" => @competition_with_access_query,
          "variables" => variables
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "access" => %{
                     "canManage" => true,
                     "canScoretake" => true
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "returns partial access rights for a scoretaker", %{
      conn: conn,
      current_user: current_user
    } do
      competition = insert(:competition)

      insert(:staff_member,
        competition: competition,
        user: current_user,
        roles: ["staff-dataentry"]
      )

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{
          "query" => @competition_with_access_query,
          "variables" => variables
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "access" => %{
                     "canManage" => false,
                     "canScoretake" => true
                   }
                 }
               }
             } == body
    end
  end

  describe "query: competition podiums" do
    @competition_with_podiums_query """
    query Competition($id: ID!) {
      competition(id: $id) {
        id
        podiums {
          round {
            id
          }
          results {
            id
          }
        }
      }
    }
    """

    test "includes final round and podium results", %{conn: conn} do
      competition = insert(:competition)
      ce333 = insert(:competition_event, competition: competition, event_id: "333")
      _ce333_r1 = insert(:round, competition_event: ce333, number: 1)
      ce333_r2 = insert(:round, competition_event: ce333, number: 2)
      ce333_r2_result1 = insert(:result, round: ce333_r2, ranking: 1, best: 900, average: 1000)
      ce333_r2_result2 = insert(:result, round: ce333_r2, ranking: 2, best: 1000, average: 1100)
      ce333_r2_result3 = insert(:result, round: ce333_r2, ranking: 3, best: 1100, average: 1200)
      _ce333_r2_result4 = insert(:result, round: ce333_r2, ranking: 4, best: 1200, average: 1300)

      variables = %{"id" => to_gql_id(competition.id)}

      conn =
        post(conn, "/api", %{
          "query" => @competition_with_podiums_query,
          "variables" => variables
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "competition" => %{
                   "id" => to_gql_id(competition.id),
                   "podiums" => [
                     %{
                       "round" => %{"id" => to_gql_id(ce333_r2.id)},
                       "results" => [
                         %{"id" => to_gql_id(ce333_r2_result1.id)},
                         %{"id" => to_gql_id(ce333_r2_result2.id)},
                         %{"id" => to_gql_id(ce333_r2_result3.id)}
                       ]
                     }
                   ]
                 }
               }
             } == body
    end
  end

  describe "query: get person" do
    @person_query """
    query Person($id: ID!) {
      person(id: $id) {
        id
        name
      }
    }
    """

    test "returns a person with matching id", %{conn: conn} do
      person = insert(:person)

      variables = %{"id" => to_gql_id(person.id)}

      conn = post(conn, "/api", %{"query" => @person_query, "variables" => variables})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "person" => %{
                   "id" => to_gql_id(person.id),
                   "name" => person.name
                 }
               }
             } == body
    end

    test "returns null if there is no person with matching id", %{conn: conn} do
      variables = %{"id" => "1"}

      conn = post(conn, "/api", %{"query" => @person_query, "variables" => variables})

      body = json_response(conn, 200)
      assert %{"data" => %{"person" => nil}} == body
    end
  end
end
