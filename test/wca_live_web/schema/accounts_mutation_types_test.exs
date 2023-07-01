defmodule WcaLiveWeb.Schema.AccountsMutationTypesTest do
  use WcaLiveWeb.ConnCase

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
end
