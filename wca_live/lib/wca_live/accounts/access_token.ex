defmodule WcaLive.Accounts.AccessToken do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.User

  @required_fields [:access_token, :refresh_token, :expires_at]
  @optional_fields []

  schema "access_tokens" do
    field :access_token, :string
    field :expires_at, :utc_datetime
    field :refresh_token, :string

    belongs_to :user, User
  end

  @doc false
  def changeset(access_token, attrs) do
    access_token
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
