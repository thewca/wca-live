defmodule WcaLive.Accounts.User do
  use WcaLive.Schema
  import Ecto.Changeset

  schema "users" do
    field :avatar_thumb_url, :string
    field :avatar_url, :string
    field :name, :string
    field :wca_id, :string
    field :wca_user_id, :integer

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:wca_user_id, :wca_id, :name, :avatar_url, :avatar_thumb_url])
    |> validate_required([:wca_user_id, :name, :avatar_url, :avatar_thumb_url])
  end
end
