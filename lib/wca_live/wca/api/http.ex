defmodule WcaLive.Wca.Api.Http do
  @moduledoc """
  Interacts with an actual WCA API at the configured URL.

  Make sure to specify the API URL in configuration like this:

      config :wca_live, WcaLive.Wca.Api.Http, api_url: "https://www.worldcubeassociation.org/api/v0"
  """

  @behaviour WcaLive.Wca.Api

  @long_request_options [timeout: 60_000, recv_timeout: 60_000]

  @impl true
  def get_me(access_token) do
    api_url("/me")
    |> HTTPoison.get(headers(access_token: access_token))
    |> parse_response()
  end

  @impl true
  def get_active_team_roles(wca_user_id, access_token) do
    params = %{
      "isActive" => true,
      "groupType" => "teams_committees"
    }

    api_url("/user_roles/user/#{wca_user_id}", params)
    |> HTTPoison.get(headers(access_token: access_token))
    |> parse_response()
  end

  @impl true
  def get_wcif(competition_wca_id, access_token) do
    api_url("/competitions/#{competition_wca_id}/wcif")
    |> HTTPoison.get(headers(access_token: access_token), @long_request_options)
    |> parse_response()
  end

  @impl true
  def patch_wcif(wcif, access_token) do
    competition_wca_id = wcif["id"]
    body = Jason.encode!(wcif)

    api_url("/competitions/#{competition_wca_id}/wcif")
    |> HTTPoison.patch(body, headers(access_token: access_token), @long_request_options)
    |> parse_response()
  end

  @impl true
  def get_upcoming_manageable_competitions(access_token) do
    two_days_ago = Date.utc_today() |> Date.add(-2)

    params = %{
      "managed_by_me" => true,
      "start" => two_days_ago
    }

    api_url("/competitions", params)
    |> HTTPoison.get(headers(access_token: access_token))
    |> parse_response()
  end

  @impl true
  def get_records() do
    api_url("/records")
    |> HTTPoison.get(headers())
    |> parse_response()
  end

  defp config() do
    Application.get_env(:wca_live, __MODULE__)
  end

  defp api_url(path, params \\ %{}) do
    query = URI.encode_query(params)
    root = Keyword.fetch!(config(), :api_url)
    root <> path <> "?" <> query
  end

  defp headers(params \\ [])

  defp headers([]) do
    [
      {"Content-Type", "application/json"},
      {"Accept", "application/json"}
    ]
  end

  defp headers([{:access_token, access_token} | params]) do
    [{"Authorization", "Bearer " <> access_token} | headers(params)]
  end

  defp parse_response({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    with {:ok, json} <- Jason.decode(body) do
      {:ok, json}
    else
      _ ->
        {:error, "failed to parse response"}
    end
  end

  defp parse_response({:ok, %HTTPoison.Response{status_code: status, body: body}}) do
    case Jason.decode(body) do
      {:ok, %{"error" => error}} ->
        {:error, "the WCA server returned an error, status: #{status}, message: #{error}"}

      _ ->
        {:error, "the WCA server returned an error, status: #{status}"}
    end
  end

  defp parse_response({:error, %HTTPoison.Error{reason: reason}}) do
    {:error, "request to the WCA server failed, reason: #{reason}"}
  end
end
