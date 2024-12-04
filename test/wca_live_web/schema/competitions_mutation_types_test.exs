defmodule WcaLiveWeb.Schema.CompetitonsMutationTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  alias WcaLive.Repo

  describe "mutation: update competition access" do
    @update_competition_access_mutation """
    mutation UpdateCompetitionAccess($input: UpdateCompetitionAccessInput!) {
      updateCompetitionAccess(input: $input) {
        competition {
          id
          staffMembers {
            user {
              id
            }
            roles
          }
        }
      }
    }
    """

    @tag signed_in: :admin
    test "overrides competition staff members based on the given attributes", %{conn: conn} do
      competition = insert(:competition)
      insert_list(3, :staff_member, competition: competition)
      user = insert(:user)

      input = %{
        "id" => to_gql_id(competition.id),
        "staffMembers" => [
          %{"userId" => to_gql_id(user.id), "roles" => ["staff-dataentry"]}
        ]
      }

      conn =
        post(conn, "/api", %{
          "query" => @update_competition_access_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "updateCompetitionAccess" => %{
                   "competition" => %{
                     "id" => to_gql_id(competition.id),
                     "staffMembers" => [
                       %{
                         "user" => %{"id" => to_gql_id(user.id)},
                         "roles" => ["staff-dataentry"]
                       }
                     ]
                   }
                 }
               }
             } == body
    end

    @tag signed_in: :admin
    test "updates existing staff members", %{conn: conn} do
      competition = insert(:competition)
      user = insert(:user)

      staff_member =
        insert(:staff_member, competition: competition, user: user, roles: ["delegate"])

      input = %{
        "id" => to_gql_id(competition.id),
        "staffMembers" => [
          %{
            "id" => to_gql_id(staff_member.id),
            "userId" => to_gql_id(user.id),
            "roles" => ["delegate", "staff-dataentry"]
          }
        ]
      }

      conn =
        post(conn, "/api", %{
          "query" => @update_competition_access_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "updateCompetitionAccess" => %{
                   "competition" => %{
                     "id" => to_gql_id(competition.id),
                     "staffMembers" => [
                       %{
                         "user" => %{"id" => to_gql_id(user.id)},
                         "roles" => ["delegate", "staff-dataentry"]
                       }
                     ]
                   }
                 }
               }
             } == body
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      competition = insert(:competition)
      user = insert(:user)

      input = %{
        "id" => to_gql_id(competition.id),
        "staffMembers" => [
          %{
            "userId" => to_gql_id(user.id),
            "roles" => ["staff-dataentry"]
          }
        ]
      }

      conn =
        post(conn, "/api", %{
          "query" => @update_competition_access_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body
    end
  end

  describe "mutation: anonymize person" do
    @anonymize_person_mutation """
    mutation AnonymizePerson($input: AnonymizePersonInput!) {
      anonymizePerson(input: $input) {
        competitionCount
      }
    }
    """

    @tag signed_in: :admin
    test "anonymizes person by wca id across all competitions", %{conn: conn} do
      person1_comp1 = insert(:person, wca_id: "2015HOLM01")
      person1_comp2 = insert(:person, wca_id: "2015HOLM01")
      person2 = insert(:person, wca_id: "2016HOLM01")

      input = %{
        "wcaId" => "2015HOLM01"
      }

      conn =
        post(conn, "/api", %{
          "query" => @anonymize_person_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"data" => %{"anonymizePerson" => %{"competitionCount" => 2}}} == body

      assert %{
               name: "Anonymous",
               wca_id: "2000ANON01",
               country_iso2: "US",
               gender: "o",
               email: "anonymous@worldcubeassociation.org",
               avatar_url: nil
             } = Repo.reload(person1_comp1)

      assert %{
               name: "Anonymous",
               wca_id: "2000ANON01",
               country_iso2: "US",
               gender: "o",
               email: "anonymous@worldcubeassociation.org",
               avatar_url: nil
             } = Repo.reload(person1_comp2)

      assert Repo.reload(person2).name == person2.name
    end

    @tag :signed_in
    test "returns an error when not authorized", %{conn: conn} do
      person1 = insert(:person, wca_id: "2015HOLM01")
      person2 = insert(:person, wca_id: "2016HOLM01")

      input = %{
        "wcaId" => "2015HOLM01"
      }

      conn =
        post(conn, "/api", %{
          "query" => @anonymize_person_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "access denied"}]} = body

      assert Repo.reload(person1).name == person1.name
      assert Repo.reload(person2).name == person2.name
    end
  end
end
