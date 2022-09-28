defmodule WcaLive.Accounts.User do
  @moduledoc """
  A user of the application, imported from the WCA website.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.{AccessToken, OneTimeCode, User}
  alias WcaLive.Competitions.{StaffMember, Person}

  @admin_teams ["wrt", "wst"]

  @required_fields [:email, :wca_user_id, :name, :wca_teams]
  @optional_fields [:wca_id, :avatar_url, :avatar_thumb_url, :country_iso2]

  schema "users" do
    field :email, :string
    field :wca_user_id, :integer
    field :name, :string
    field :wca_id, :string
    field :country_iso2, :string
    field :avatar_url, :string
    field :avatar_thumb_url, :string
    field :wca_teams, {:array, :string}, default: []

    has_one :access_token, AccessToken, on_replace: :update
    has_one :one_time_code, OneTimeCode, on_replace: :delete

    has_many :staff_members, StaffMember
    has_many :people, Person, foreign_key: :wca_id, references: :wca_id

    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  @doc """
  Converts the given JSON data received from
  the WCA website into `User` attributes map.
  """
  @spec wca_json_to_attrs(map()) :: map()
  def wca_json_to_attrs(json) do
    %{
      email: json["email"],
      wca_user_id: json["id"],
      name: json["name"],
      wca_id: json["wca_id"],
      country_iso2: json["country_iso2"],
      avatar_url: json["avatar"]["url"],
      avatar_thumb_url: json["avatar"]["thumb_url"],
      wca_teams: json["teams"] |> Enum.map(& &1["friendly_id"]) |> Enum.map(&String.downcase/1)
    }
  end

  @doc """
  Returns `true` if `user` has admin rights based
  on the WCA teams they belong to.
  """
  @spec admin?(%User{}) :: boolean()
  def admin?(user) do
    Enum.any?(user.wca_teams, fn team -> team in @admin_teams end)
  end
end
