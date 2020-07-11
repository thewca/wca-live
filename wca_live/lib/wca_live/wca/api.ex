defmodule WcaLive.Wca.Api do
  @moduledoc """
  Interacts with the WCA API.
  """

  @doc """
  Fetches the user related to the given access token.
  """
  @spec get_me(String.t()) :: {:ok, any()} | {:error, any()}
  def get_me(access_token) do
    api_url("/me")
    |> HTTPoison.get(headers(access_token: access_token))
    |> parse_response()
  end

  @doc """
  Fetches WCIF for the given competition id.
  """
  @spec get_wcif(String.t(), String.t()) :: {:ok, any()} | {:error, any()}
  def get_wcif(competition_wca_id, access_token) do
    api_url("/competitions/#{competition_wca_id}/wcif")
    |> HTTPoison.get(headers(access_token: access_token))
    |> parse_response()
  end

  @doc """
  Fetches upcoming competitions manageable by the authorized user.
  """
  @spec get_upcoming_manageable_competitions(String.t()) :: {:ok, any()} | {:error, any()}
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

  @doc """
  Fetches official regional records.
  """
  @spec get_records() :: {:ok, any()} | {:error, any()}
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
    {:ok, Jason.decode!(body)}
  end

  defp parse_response({:ok, %HTTPoison.Response{body: body}}) do
    case Jason.decode!(body) do
      %{"error" => error} -> {:error, error}
      _ -> {:error, "something went wrong"}
    end
  end

  defp parse_response({:error, %HTTPoison.Error{reason: reason}}) do
    {:error, reason}
  end
end
