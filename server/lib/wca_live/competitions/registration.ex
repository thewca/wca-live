defmodule WcaLive.Competitions.Registration do
  @moduledoc """
  A person's registration data for a competition.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Person, CompetitionEvent, Registration}

  @required_fields [:wca_registration_id, :status, :guests]
  @optional_fields [:comments]

  schema "registrations" do
    field :wca_registration_id, :integer
    field :status, :string
    field :guests, :integer
    field :comments, :string, default: ""

    belongs_to :person, Person

    many_to_many :competition_events, CompetitionEvent,
      join_through: "registration_competition_events"
  end

  def changeset(registration, attrs) do
    registration
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:status, ["accepted", "pending", "deleted"])
  end

  @doc """
  Returns `true` if the given registration is accepted.
  """
  @spec accepted?(%Registration{}) :: boolean()
  def accepted?(%Registration{status: "accepted"}), do: true
  def accepted?(%Registration{status: _other}), do: false
end
