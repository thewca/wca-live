defmodule WcaLive.Accounts.ScoretakingToken do
  @moduledoc """
  A competition-scoped token for scoretaking API calls from external
  systems.
  """

  use WcaLive.Schema

  import Ecto.Query

  alias WcaLive.{Accounts, Competitions}
  alias WcaLive.Accounts.ScoretakingToken

  @rand_size 32

  @validity_in_days 7

  schema "scoretaking_tokens" do
    field :token, :string

    belongs_to :user, Accounts.User
    belongs_to :competition, Competitions.Competition

    timestamps(updated_at: false)
  end

  @doc """
  Generates a new competition-scoped token for the given user.
  """
  @spec build_scoretaking_token(%Accounts.User{}, %Competitions.Competition{}) :: %__MODULE__{}
  def build_scoretaking_token(user, competition) do
    token = :crypto.strong_rand_bytes(@rand_size) |> Base.url_encode64(padding: false)
    %ScoretakingToken{token: token, user_id: user.id, competition_id: competition.id}
  end

  @doc """
  Returns query that verifies the token and returns the user and
  competition, if any.

  The token is valid if it matches the value in the database and it
  has not expired.
  """
  @spec verify_token_query(String.t()) :: Ecto.Query.t()
  def verify_token_query(token) do
    from(token in token_query(token),
      join: user in assoc(token, :user),
      join: competition in assoc(token, :competition),
      where: token.inserted_at > ago(@validity_in_days, "day"),
      select: {user, competition}
    )
  end

  @doc """
  Returns query to lookup token struct for the given token value.
  """
  @spec token_query(String.t()) :: Ecto.Query.t()
  def token_query(token) do
    from(ScoretakingToken, where: [token: ^token])
  end

  @doc """
  Returns query to lookup all active tokens for the given user.
  """
  @spec active_tokens_for_user_query(%Accounts.User{}) :: Ecto.Query.t()
  def active_tokens_for_user_query(user) do
    from(token in ScoretakingToken,
      where: token.user_id == ^user.id and token.inserted_at > ago(@validity_in_days, "day")
    )
  end
end
