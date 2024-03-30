defmodule WcaLive.Wca.Api.Http do
  @moduledoc """
  Interacts with an actual WCA API at the configured URL.

  Make sure to specify the API URL in configuration like this:

      config :wca_live, WcaLive.Wca.Api.Http, api_url: "https://www.worldcubeassociation.org/api/v0"
  """

  @behaviour WcaLive.Wca.Api

  @impl true
  def get_me(access_token) do
    build_req()
    |> with_user_token(access_token)
    |> request(url: "/me")
  end

  @impl true
  def get_active_team_roles(wca_user_id, access_token) do
    params = %{
      "isActive" => true,
      "groupType" => "teams_committees"
    }

    build_req()
    |> with_user_token(access_token)
    |> request(url: "/user_roles/user/#{wca_user_id}", params: params)
  end

  @impl true
  def get_wcif(competition_wca_id, access_token) do
    build_req()
    |> with_user_token(access_token)
    |> with_long_timeout()
    |> request(url: "/competitions/#{competition_wca_id}/wcif")
  end

  @impl true
  def patch_wcif(wcif, access_token) do
    competition_wca_id = wcif["id"]

    build_req()
    |> with_user_token(access_token)
    |> with_long_timeout()
    |> request(url: "/competitions/#{competition_wca_id}/wcif", method: :patch, json: wcif)
  end

  @impl true
  def get_upcoming_manageable_competitions(access_token) do
    two_days_ago = Date.utc_today() |> Date.add(-2)

    params = %{
      "managed_by_me" => true,
      "start" => two_days_ago
    }

    build_req()
    |> with_user_token(access_token)
    |> request(url: "/competitions", params: params)
  end

  @impl true
  def get_records() do
    build_req()
    |> request(url: "/records")
  end

  defp build_req() do
    base_url = Keyword.fetch!(config(), :api_url)
    Req.new(base_url: base_url)
  end

  defp with_user_token(req, access_token) do
    Req.merge(req, auth: {:bearer, access_token})
  end

  defp with_long_timeout(req) do
    Req.merge(req, receive_timeout: 60_000)
  end

  defp request(req, opts) do
    case Req.request(req, opts) do
      {:ok, %{status: status, body: body}} when status in 200..299 ->
        {:ok, body}

      {:ok, %{status: status, body: %{"error" => error}}} ->
        {:error, "the WCA server returned an error, status: #{status}, message: #{error}"}

      {:ok, %{status: status}} ->
        {:error, "the WCA server returned an error, status: #{status}"}

      {:error, exception} ->
        {:error, "request to the WCA server failed, reason: #{Exception.message(exception)}"}
    end
  end

  defp config() do
    Application.get_env(:wca_live, __MODULE__)
  end
end
