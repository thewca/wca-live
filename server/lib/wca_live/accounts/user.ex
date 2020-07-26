defmodule WcaLive.Accounts.User do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.AccessToken
  alias WcaLive.Competitions.StaffMember

  @admin_teams ["wrt", "wst"]

  @required_fields [:wca_user_id, :name, :wca_teams]
  @optional_fields [:wca_id, :avatar_url, :avatar_thumb_url, :country_iso2]

  schema "users" do
    field :wca_user_id, :integer
    field :name, :string
    field :wca_id, :string
    field :country_iso2, :string
    field :avatar_url, :string
    field :avatar_thumb_url, :string
    field :wca_teams, {:array, :string}, default: []

    has_one :access_token, AccessToken, on_replace: :update

    has_many :staff_members, StaffMember

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  def wca_json_to_attrs(json) do
    %{
      wca_user_id: json["id"],
      name: json["name"],
      wca_id: json["wca_id"],
      country_iso2: json["country_iso2"],
      avatar_url: json["avatar"]["url"],
      avatar_thumb_url: json["avatar"]["thumb_url"],
      wca_teams: json["teams"] |> Enum.map(& &1["friendly_id"]) |> Enum.map(&String.downcase/1)
    }
  end

  def admin?(user) do
    Enum.any?(user.wca_teams, fn team -> team in @admin_teams end)
  end
end
