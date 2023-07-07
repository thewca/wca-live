defmodule WcaLiveWeb.ErrorJSONTest do
  use WcaLiveWeb.ConnCase, async: true

  test "renders 404.json" do
    assert WcaLiveWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500.json" do
    assert WcaLiveWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
