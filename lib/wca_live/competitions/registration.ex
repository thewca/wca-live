defmodule WcaLive.Competitions.Registration do
  @moduledoc """
  A person's registration data for a competition.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions
  alias WcaLive.Competitions.Registration

  @required_fields [:wca_registration_id, :status, :guests]
  @optional_fields [:comments]

  schema "registrations" do
    field :wca_registration_id, :integer
    field :status, :string
    field :guests, :integer
    field :comments, :string, default: ""

    belongs_to :person, Competitions.Person

    many_to_many :competition_events, Competitions.CompetitionEvent,
      join_through: "registration_competition_events",
      on_replace: :delete
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
