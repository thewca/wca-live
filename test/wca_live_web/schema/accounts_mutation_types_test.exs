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

  describe "mutation: generate scoretaking token" do
    @generate_token_mutation """
    mutation GenerateScoretakingToken($input: GenerateScoretakingTokenInput!) {
      generateScoretakingToken(input: $input) {
        token
        scoretakingToken {
          id
        }
      }
    }
    """

    test "returns an error when not authenticated", %{conn: conn} do
      competition = insert(:competition)

      input = %{"competitionId" => competition.id}

      conn =
        post(conn, "/api", %{
          "query" => @generate_token_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)
      assert %{"errors" => [%{"message" => "not authenticated"}]} = body
    end

    @tag :signed_in
    test "returns an error when the user is not authorized to scoretake the given competition",
         %{conn: conn} do
      competition = insert(:competition)

      input = %{"competitionId" => competition.id}

      conn =
        post(conn, "/api", %{
          "query" => @generate_token_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "errors" => [
                 %{"message" => "you do not have scoretaking access for this competition"}
               ]
             } = body
    end

    @tag :signed_in
    test "returns the generated token", %{conn: conn, current_user: current_user} do
      competition = insert(:competition)
      insert(:staff_member, competition: competition, user: current_user, roles: ["delegate"])

      input = %{"competitionId" => competition.id}

      conn =
        post(conn, "/api", %{
          "query" => @generate_token_mutation,
          "variables" => %{"input" => input}
        })

      body = json_response(conn, 200)

      assert %{
               "data" => %{
                 "generateScoretakingToken" => %{"token" => _, "scoretakingToken" => %{"id" => _}}
               }
             } = body
    end
  end
end
