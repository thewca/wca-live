defmodule WcaLiveWeb.Schema.ScoretakingMutationTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "mutation: open round" do
    @open_round_mutation """
    mutation OpenRound($input: OpenRoundInput!) {
      openRound(input: $input) {
        round {
          id
          open
          results {
            attempts {
              result
            }
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "creates empty results for the given round", %{conn: conn} do
      round = insert(:round, number: 1)
      insert_list(3, :registration, competition_events: [round.competition_event])

      input = %{"id" => to_gql_id(round.id)}

      conn =
        post(conn, "/api", %{
          "query" => @open_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "openRound" => %{
                   "round" => %{
                     "id" => to_gql_id(round.id),
                     "open" => true,
                     "results" => [
                       %{"attempts" => []},
                       %{"attempts" => []},
                       %{"attempts" => []}
                     ]
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "grants access for scoretakers", %{conn: conn, current_user: current_user} do
      round = insert_round_with_scoretaker(current_user, number: 1)
      insert_list(3, :registration, competition_events: [round.competition_event])

      input = %{"id" => to_gql_id(round.id)}

      conn =
        post(conn, "/api", %{
          "query" => @open_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"openRound" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      round = insert(:round, number: 1, number: 1)
      insert_list(3, :registration, competition_events: [round.competition_event])

      input = %{"id" => to_gql_id(round.id)}

      conn =
        post(conn, "/api", %{
          "query" => @open_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  describe "mutation: clear round" do
    @clear_round_mutation """
    mutation ClearRound($input: ClearRoundInput!) {
      clearRound(input: $input) {
        round {
          id
          open
          results {
            id
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "removes all round results", %{conn: conn} do
      round = insert(:round)
      insert_list(4, :result, round: round)

      input = %{"id" => to_gql_id(round.id)}

      conn =
        post(conn, "/api", %{
          "query" => @clear_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "clearRound" => %{
                   "round" => %{
                     "id" => to_gql_id(round.id),
                     "open" => false,
                     "results" => []
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "grants access for scoretakers", %{conn: conn, current_user: current_user} do
      round = insert_round_with_scoretaker(current_user)
      insert_list(4, :result, round: round)

      input = %{"id" => to_gql_id(round.id)}

      conn =
        post(conn, "/api", %{
          "query" => @clear_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"clearRound" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      round = insert(:round)
      insert_list(4, :result, round: round)

      input = %{"id" => to_gql_id(round.id)}

      conn =
        post(conn, "/api", %{
          "query" => @clear_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  describe "mutation: enter result attempts" do
    @enter_reslut_attempt_mutation """
    mutation EnterResults($input: EnterResultsInput!) {
      enterResults(input: $input) {
        round {
          results {
            id
            attempts {
              result
            }
            best
            average
            ranking
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "updates result attempt list and related attributes", %{conn: conn} do
      round = insert(:round)
      result = insert(:result, round: round)

      input = %{
        "id" => to_gql_id(round.id),
        "results" => [
          %{
            "id" => to_gql_id(result.id),
            "attempts" => [
              %{"result" => 1500},
              %{"result" => 1400},
              %{"result" => 1300},
              %{"result" => -1},
              %{"result" => 1100}
            ]
          }
        ]
      }

      conn =
        post(conn, "/api", %{
          "query" => @enter_reslut_attempt_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "enterResults" => %{
                   "round" => %{
                     "results" => [
                       %{
                         "id" => to_gql_id(result.id),
                         "attempts" => [
                           %{"result" => 1500},
                           %{"result" => 1400},
                           %{"result" => 1300},
                           %{"result" => -1},
                           %{"result" => 1100}
                         ],
                         "best" => 1100,
                         "average" => 1400,
                         "ranking" => 1
                       }
                     ]
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "grants access for scoretakers", %{conn: conn, current_user: current_user} do
      round = insert_round_with_scoretaker(current_user)
      result = insert(:result, round: round)

      input = %{
        "id" => to_gql_id(round.id),
        "results" => [
          %{
            "id" => to_gql_id(result.id),
            "attempts" => []
          }
        ]
      }

      conn =
        post(conn, "/api", %{
          "query" => @enter_reslut_attempt_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"enterResults" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      round = insert(:round)
      result = insert(:result, round: round)

      input = %{
        "id" => to_gql_id(round.id),
        "results" => [
          %{
            "id" => to_gql_id(result.id),
            "attempts" => []
          }
        ]
      }

      conn =
        post(conn, "/api", %{
          "query" => @enter_reslut_attempt_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  describe "mutation: add person to round" do
    @add_person_to_round_mutation """
    mutation AddPersonToRound($input: AddPersonToRoundInput!) {
      addPersonToRound(input: $input) {
        round {
          id
          results {
            person {
              id
            }
            attempts {
              result
            }
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "creates an empty result for the given person", %{conn: conn} do
      round = insert(:round)
      person = insert(:person, competition: round.competition_event.competition)
      insert(:registration, person: person, status: "accepted")

      input = %{"roundId" => to_gql_id(round.id), "personId" => to_gql_id(person.id)}

      conn =
        post(conn, "/api", %{
          "query" => @add_person_to_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "addPersonToRound" => %{
                   "round" => %{
                     "id" => to_gql_id(round.id),
                     "results" => [
                       %{
                         "person" => %{"id" => to_gql_id(person.id)},
                         "attempts" => []
                       }
                     ]
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "grants access for scoretakers", %{conn: conn, current_user: current_user} do
      round = insert_round_with_scoretaker(current_user)
      person = insert(:person, competition: round.competition_event.competition)
      insert(:registration, person: person, status: "accepted")

      input = %{"roundId" => to_gql_id(round.id), "personId" => to_gql_id(person.id)}

      conn =
        post(conn, "/api", %{
          "query" => @add_person_to_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"addPersonToRound" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      round = insert(:round)
      person = insert(:person, competition: round.competition_event.competition)
      insert(:registration, person: person, status: "accepted")

      input = %{"roundId" => to_gql_id(round.id), "personId" => to_gql_id(person.id)}

      conn =
        post(conn, "/api", %{
          "query" => @add_person_to_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  describe "mutation: remove person from round" do
    @remove_person_from_round_mutation """
    mutation RemovePersonFromRound($input: RemovePersonFromRoundInput!) {
      removePersonFromRound(input: $input) {
        round {
          id
          results {
            id
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "removes round result of the given person", %{conn: conn} do
      round = insert(:round)
      person = insert(:person)
      insert(:result, round: round, person: person)

      input = %{
        "roundId" => to_gql_id(round.id),
        "personId" => to_gql_id(person.id),
        "replace" => false
      }

      conn =
        post(conn, "/api", %{
          "query" => @remove_person_from_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "removePersonFromRound" => %{
                   "round" => %{
                     "id" => to_gql_id(round.id),
                     "results" => []
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "grants access for scoretakers", %{conn: conn, current_user: current_user} do
      round = insert_round_with_scoretaker(current_user)
      person = insert(:person)
      insert(:result, round: round, person: person)

      input = %{
        "roundId" => to_gql_id(round.id),
        "personId" => to_gql_id(person.id),
        "replace" => false
      }

      conn =
        post(conn, "/api", %{
          "query" => @remove_person_from_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"removePersonFromRound" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      round = insert(:round)
      person = insert(:person)
      insert(:result, round: round, person: person)

      input = %{
        "roundId" => to_gql_id(round.id),
        "personId" => to_gql_id(person.id),
        "replace" => false
      }

      conn =
        post(conn, "/api", %{
          "query" => @remove_person_from_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  describe "mutation: remove no-shows from round" do
    @remove_no_shows_from_round_mutation """
    mutation RemoveNoShowsFromRound($input: RemoveNoShowsFromRoundInput!) {
      removeNoShowsFromRound(input: $input) {
        round {
          id
          results {
            person {
              id
            }
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "removes round result of the given person", %{conn: conn} do
      round = insert(:round)
      person1 = insert(:person)
      insert(:result, round: round, person: person1)

      person2 = insert(:person)
      insert(:result, round: round, person: person2, attempts: [])

      person3 = insert(:person)
      insert(:result, round: round, person: person3, attempts: [])

      input = %{
        "roundId" => to_gql_id(round.id),
        "personIds" => [to_gql_id(person2.id), to_gql_id(person3.id)]
      }

      conn =
        post(conn, "/api", %{
          "query" => @remove_no_shows_from_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "removeNoShowsFromRound" => %{
                   "round" => %{
                     "id" => to_gql_id(round.id),
                     "results" => [%{"person" => %{"id" => to_gql_id(person1.id)}}]
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "grants access for scoretakers", %{conn: conn, current_user: current_user} do
      round = insert_round_with_scoretaker(current_user)
      person = insert(:person)
      insert(:result, round: round, person: person, attempts: [])

      input = %{
        "roundId" => to_gql_id(round.id),
        "personIds" => [to_gql_id(person.id)]
      }

      conn =
        post(conn, "/api", %{
          "query" => @remove_no_shows_from_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"removeNoShowsFromRound" => _}} = body
      assert false == Map.has_key?(body, "errors")
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      round = insert(:round)
      person = insert(:person)
      insert(:result, round: round, person: person, attempts: [])

      input = %{
        "roundId" => to_gql_id(round.id),
        "personIds" => [to_gql_id(person.id)]
      }

      conn =
        post(conn, "/api", %{
          "query" => @remove_no_shows_from_round_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  def insert_round_with_scoretaker(user, attrs \\ []) do
    competition = insert(:competition)
    insert(:staff_member, competition: competition, user: user, roles: ["staff-dataentry"])

    competition_event = insert(:competition_event, competition: competition)
    insert(:round, [{:competition_event, competition_event} | attrs])
  end
end
