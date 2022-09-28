defmodule WcaLiveWeb.Schema.CompetitonsMutationTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "mutation: update competition access" do
    @update_competition_access_mutation """
    mutation UpdateCompetitionAccess($input: UpdateCompetitionAccessMutation!) {
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
end
