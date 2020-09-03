defmodule WcaLiveWeb.Schema.AccountsMutationTypesTest do
  use WcaLiveWeb.ConnCase

  import WcaLive.Factory

  describe "mutation: generate one time code" do
    @generate_otc_mutation """
    mutation GenerateOneTimeCode {
      generateOneTimeCode {
        oneTimeCode {
          id
          code
        }
      }
    }
    """

    test "returns an error when not authenticated", %{conn: conn} do
      conn = post(conn, "/api", %{"query" => @generate_otc_mutation})

      body = json_response(conn, 200)
      assert %{"errors" => [%{"message" => "not authenticated"}]} = body
    end

    @tag :signed_in
    test "returns a one time code", %{conn: conn} do
      conn = post(conn, "/api", %{"query" => @generate_otc_mutation})

      body = json_response(conn, 200)
      assert %{"data" => %{"generateOneTimeCode" => %{"oneTimeCode" => %{"code" => _}}}} = body
    end
  end

  describe "mutation: sign in using one time code" do
    @sign_in_mutation """
    mutation SignIn($input: SignInInput!) {
      signIn(input: $input) {
        token
        user {
          id
        }
      }
    }
    """

    test "returns user and token if the given code is valid", %{conn: conn} do
      user = insert(:user)
      otc = insert(:one_time_code, user: user)

      input = %{"code" => otc.code}

      conn =
        post(conn, "/api", %{"query" => @sign_in_mutation, "variables" => %{"input" => input}})

      body = json_response(conn, 200)
      id = to_gql_id(user.id)
      assert %{"data" => %{"signIn" => %{"token" => _, "user" => %{"id" => ^id}}}} = body
    end

    test "returns an error when the code is expired", %{conn: conn} do
      user = insert(:user)
      hour_ago = DateTime.utc_now() |> DateTime.add(-3600, :second)
      otc = insert(:one_time_code, user: user, expires_at: hour_ago)

      input = %{"code" => otc.code}

      conn =
        post(conn, "/api", %{"query" => @sign_in_mutation, "variables" => %{"input" => input}})

      body = json_response(conn, 200)

      assert %{"errors" => [%{"message" => "code expired"}]} = body
    end
  end
end
