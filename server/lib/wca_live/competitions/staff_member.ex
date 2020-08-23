defmodule WcaLive.Competitions.StaffMember do
  @moduledoc """
  Represents an application user having some roles at a competition.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.{Competition, StaffMember}

  @allowed_roles ["delegate", "organizer", "staff-dataentry"]
  @min_roles 1

  @required_fields [:roles]
  @optional_fields []

  schema "staff_members" do
    field :roles, {:array, :string}, default: []

    belongs_to :user, User
    belongs_to :competition, Competition
  end

  def changeset(staff_member, attrs) do
    staff_member
    |> cast(attrs, @required_fields ++ @optional_fields ++ [:user_id])
    |> validate_required(@required_fields)
    |> validate_subset(:roles, @allowed_roles)
    |> validate_length(:roles, min: @min_roles)
  end

  @doc """
  Checks if the given string is a recognised staff role.
  """
  @spec valid_staff_role?(String.t()) :: boolean()
  def valid_staff_role?(role), do: role in @allowed_roles

  @doc """
  Checks if `staff_member` is a manager - either delegate or organizer.
  """
  @spec manager?(%StaffMember{}) :: boolean()
  def manager?(staff_member) do
    "delegate" in staff_member.roles or "organizer" in staff_member.roles
  end

  @doc """
  Checks if `staff_member` has the scoretaker role.
  """
  @spec scoretaker?(%StaffMember{}) :: boolean()
  def scoretaker?(staff_member) do
    "staff-dataentry" in staff_member.roles
  end
end
