defmodule WcaLiveWeb.Auth do
  @moduledoc """
  Functions related to user authentication and tokens.
  """

  @token_seed "user-auth"
  @token_max_age 86400

  @type user_id :: integer()
  @type token :: String.t()

  @doc """
  Generates a token including user identifier.
  """
  @spec generate_token(user_id()) :: token()
  def generate_token(user_id) do
    Phoenix.Token.sign(WcaLiveWeb.Endpoint, @token_seed, user_id)
  end

  @doc """
  Extracts user identifier from the given token.

  Returns an error if the token is invalid or expired.
  """
  @spec verify_token(token()) :: {:ok, user_id()} | {:error, term()}
  def verify_token(token) do
    Phoenix.Token.verify(WcaLiveWeb.Endpoint, @token_seed, token, max_age: @token_max_age)
  end
end
