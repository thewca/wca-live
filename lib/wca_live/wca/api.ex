defmodule WcaLive.Wca.Api do
  @moduledoc """
  Requests to the WCA API.
  """

  @doc """
  Fetches the user related to the given access token.
  """
  @spec get_me(String.t()) :: {:ok, term()} | {:error, String.t()}
  def get_me(access_token) do
    build_req()
    |> with_user_token(access_token)
    |> request(url: "/me")
  end

  @doc """
  Fetches active team roles for the given WCA user.
  """
  @spec get_active_team_roles(String.t(), String.t()) :: {:ok, term()} | {:error, String.t()}
  def get_active_team_roles(wca_user_id, access_token) do
    params = %{
      "isActive" => true,
      "groupType" => "teams_committees"
    }

    build_req()
    |> with_user_token(access_token)
    |> request(url: "/user_roles/user/#{wca_user_id}", params: params)
  end

  @doc """
  Fetches WCIF for the given competition id.
  """
  @spec get_wcif(String.t(), String.t()) :: {:ok, any()} | {:error, String.t()}
  def get_wcif(competition_wca_id, access_token) do
    build_req()
    |> with_user_token(access_token)
    |> with_long_timeout()
    |> request(url: "/competitions/#{competition_wca_id}/wcif")
  end

  @doc """
  Saves the given WCIF.
  """
  @spec patch_wcif(any(), String.t()) :: {:ok, any()} | {:error, String.t()}
  def patch_wcif(wcif, access_token) do
    competition_wca_id = wcif["id"]

    build_req()
    |> with_user_token(access_token)
    |> with_long_timeout()
    |> request(url: "/competitions/#{competition_wca_id}/wcif", method: :patch, json: wcif)
  end

  @doc """
  Fetches upcoming competitions manageable by the authorized user.
  """
  @spec get_upcoming_manageable_competitions(String.t()) :: {:ok, any()} | {:error, String.t()}
  def get_upcoming_manageable_competitions(access_token) do
    two_days_ago = Date.utc_today() |> Date.add(-2)

    params = %{
      "managed_by_me" => true,
      "start" => two_days_ago,
      "sort" => "start_date"
    }

    build_req()
    |> with_user_token(access_token)
    |> request(url: "/competitions", params: params)
  end

  @doc """
  Fetches official regional records.
  """
  @spec get_records() :: {:ok, any()} | {:error, String.t()}
  def get_records() do
    build_req()
    |> Req.merge(Keyword.get(config(), :records_req_options, []))
    |> request(url: "/records")
  end

  defp build_req() do
    base_url = Keyword.fetch!(config(), :url)
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
    Application.get_env(:wca_live, :wca_api, [])
  end
end
