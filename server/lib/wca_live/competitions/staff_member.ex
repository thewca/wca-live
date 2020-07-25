defmodule WcaLive.Competitions.StaffMember do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.Competition

  @allowed_roles ["delegate", "organizer", "staff-dataentry"]
  @min_roles 1

  @required_fields [:roles]
  @optional_fields []

  schema "staff_members" do
    field :roles, {:array, :string}, default: []

    belongs_to :user, User
    belongs_to :competition, Competition
  end

  @doc false
  def changeset(staff_member, attrs) do
    staff_member
    |> cast(attrs, @required_fields ++ @optional_fields ++ [:user_id])
    |> validate_required(@required_fields)
    |> validate_subset(:roles, @allowed_roles)
    |> validate_length(:roles, min: @min_roles)
  end

  def valid_staff_role?(role), do: role in @allowed_roles

  def manager?(staff_member) do
    "delegate" in staff_member.roles or "organizer" in staff_member.roles
  end

  def scoretaker?(staff_member) do
    "staff-dataentry" in staff_member.roles
  end
end
