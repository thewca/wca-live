defmodule WcaLive.Accounts.UserToken do
  use Ecto.Schema

  import Ecto.Query

  alias WcaLive.Accounts

  @rand_size 32

  @session_validity_in_days 1

  schema "user_tokens" do
    field :token, :string
    field :context, :string
    belongs_to :user, Accounts.User

    timestamps(updated_at: false)
  end

  @doc """
  Generates a token that will be stored in a signed place, such as
  session or cookie.

  As those storage places are signed, those tokens do not need to be
  hashed.

  The reason why we store session tokens in the database, even though
  Phoenix already provides a session cookie, is because Phoenix' default
  session cookies are not persisted, they are simply signed and
  potentially encrypted. This means they are valid indefinitely, unless
  you change the signing/encryption salt.
  """
  def build_session_token(user) do
    token = :crypto.strong_rand_bytes(@rand_size) |> Base.url_encode64(padding: false)
    %Accounts.UserToken{token: token, context: "session", user_id: user.id}
  end

  @doc """
  Returns query that verifies the token and returns the user, if any.

  The token is valid if it matches the value in the database and it
  has not expired.
  """
  def verify_session_token_query(token) do
    from(token in token_and_context_query(token, "session"),
      join: user in assoc(token, :user),
      where: token.inserted_at > ago(@session_validity_in_days, "day"),
      select: user
    )
  end

  @doc """
  Returns query to lookup token struct for the given token value and
  context.
  """
  def token_and_context_query(token, context) do
    from(Accounts.UserToken, where: [token: ^token, context: ^context])
  end
end
