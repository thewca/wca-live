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

  defp config() do
    Application.get_env(:wca_live, __MODULE__)
  end

  defp api_url(path) do
    root = Keyword.fetch!(config(), :api_url)
    root <> path
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
