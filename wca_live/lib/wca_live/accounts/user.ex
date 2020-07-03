defmodule WcaLive.Accounts.User do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.AccessToken

  @required_fields [:wca_user_id, :name]
  @optional_fields [:wca_id, :avatar_url, :avatar_thumb_url]

  schema "users" do
    field :avatar_thumb_url, :string
    field :avatar_url, :string
    field :name, :string
    field :wca_id, :string
    field :wca_user_id, :integer

    has_one :access_token, AccessToken, on_replace: :update

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
