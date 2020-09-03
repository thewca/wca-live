defmodule WcaLiveWeb.Schema.AccountsTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "query: current user" do
    @current_user_query """
    query CurrentUser {
      currentUser {
        id
        name
      }
    }
    """

    test "returns null when not authenticated", %{conn: conn} do
      conn = post(conn, "/api", %{"query" => @current_user_query})

      body = json_response(conn, 200)
      assert %{"data" => %{"currentUser" => nil}} == body
    end

    @tag :signed_in
    test "returns user based on authentication token", %{conn: conn, current_user: current_user} do
      conn = post(conn, "/api", %{"query" => @current_user_query})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "currentUser" => %{
                   "id" => to_gql_id(current_user.id),
                   "name" => current_user.name
                 }
               }
             } == body
    end
  end

  describe "query: user staff members" do
    @current_user_query """
    query CurrentUser {
      currentUser {
        staffMembers {
          id
        }
      }
    }
    """

    @tag :signed_in
    test "returns a list of staff members corresponding to the given user", %{
      conn: conn,
      current_user: current_user
    } do
      staff_member = insert(:staff_member, user: current_user)
      # other staff member
      insert(:staff_member)

      conn = post(conn, "/api", %{"query" => @current_user_query})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "currentUser" => %{
                   "staffMembers" => [%{"id" => to_gql_id(staff_member.id)}]
                 }
               }
             } == body
    end
  end

  describe "query: list users" do
    @users_query """
    query Users {
      users(filter: "sher") {
        id
        name
      }
    }
    """

    test "returns a list of users matching the filter argument", %{conn: conn} do
      # matching user
      user = insert(:user, name: "Sherlock Holmes")
      # non-matching user
      insert(:user, name: "John Watson")

      conn = post(conn, "/api", %{"query" => @users_query})

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "users" => [
                   %{
                     "id" => to_gql_id(user.id),
                     "name" => user.name
                   }
                 ]
               }
             } == body
    end
  end
end
