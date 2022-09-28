defmodule WcaLive.Wca.OAuth do
  @moduledoc """
  Interacts with the WCA OAuth2 provider.
  """

  @type token :: %{
          access_token: String.t(),
          refresh_token: String.t(),
          expires_at: DateTime.t()
        }

  @doc """
  Returns the authorize URL to navigate the user to.
  """
  @spec authorize_url(String.t()) :: String.t()
  def authorize_url(scope \\ "public") do
    cfg = config()

    query =
      URI.encode_query(%{
        client_id: Keyword.fetch!(cfg, :client_id),
        redirect_uri: Keyword.fetch!(cfg, :redirect_uri),
        response_type: "code",
        scope: scope
      })

    Keyword.fetch!(cfg, :authorize_url) <> "?" <> query
  end

  @doc """
  Exchanges the given code for an access token.
  """
  @spec get_token(String.t()) :: {:ok, token()} | {:error, any()}
  def get_token(code) do
    cfg = config()

    body =
      Jason.encode!(%{
        client_id: Keyword.fetch!(cfg, :client_id),
        client_secret: Keyword.fetch!(cfg, :client_secret),
        redirect_uri: Keyword.fetch!(cfg, :redirect_uri),
        code: code,
        grant_type: "authorization_code"
      })

    HTTPoison.post(Keyword.fetch!(cfg, :token_url), body, headers())
    |> parse_token_response()
  end

  @doc """
  Fetches a new access token using the given refresh token.
  """
  @spec refresh_token(String.t()) :: {:ok, token()} | {:error, any()}
  def refresh_token(refresh_token) do
    cfg = config()

    body =
      Jason.encode!(%{
        client_id: Keyword.fetch!(cfg, :client_id),
        client_secret: Keyword.fetch!(cfg, :client_secret),
        grant_type: "refresh_token",
        refresh_token: refresh_token
      })

    HTTPoison.post(Keyword.fetch!(cfg, :token_url), body, headers())
    |> parse_token_response()
  end

  defp config() do
    Application.get_env(:wca_live, __MODULE__)
  end

  defp headers() do
    [
      {"Content-Type", "application/json"},
      {"Accept", "application/json"}
    ]
  end

  defp parse_token_response({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    data = Jason.decode!(body)

    {:ok,
     %{
       access_token: data["access_token"],
       refresh_token: data["refresh_token"],
       expires_at: data["expires_in"] |> expires_at()
     }}
  end

  defp parse_token_response({:ok, %HTTPoison.Response{}}) do
    {:error, "something went wrong"}
  end

  defp parse_token_response({:error, %HTTPoison.Error{reason: reason}}) do
    {:error, reason}
  end

  defp expires_at(expires_in) do
    DateTime.utc_now()
    |> DateTime.add(expires_in, :second)
  end
end
