defmodule WcaLive.Accounts.AccessToken do
  @moduledoc """
  An OAuth2 access token information.

  This data is obtained from the WCA website
  when the user goes through the OAuth2 flow.
  The actual token allows for making requests
  to the WCA API on behalf of the corresponding user.
  """

  use WcaLive.Schema

  import Ecto.Changeset

  alias WcaLive.Accounts

  @required_fields [:access_token, :refresh_token, :expires_at]
  @optional_fields []

  schema "access_tokens" do
    field :access_token, :string
    field :expires_at, :utc_datetime
    field :refresh_token, :string

    belongs_to :user, Accounts.User
  end

  def changeset(access_token, attrs) do
    access_token
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  @doc """
  Returns `true` if the `access_token` expires in 2 minutes.
  """
  @spec expires_soon?(%Accounts.AccessToken{}) :: boolean()
  def expires_soon?(access_token) do
    DateTime.diff(access_token.expires_at, DateTime.utc_now(), :second) <= 2 * 60
  end
end
