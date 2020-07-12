defmodule WcaLive.Competitions.Registration do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.Person

  @required_fields [:wca_registration_id, :status, :event_ids, :guests]
  @optional_fields [:comments]

  schema "registrations" do
    field :wca_registration_id, :integer
    field :status, :string
    field :event_ids, {:array, :string}
    field :guests, :integer
    field :comments, :string, default: ""

    belongs_to :person, Person
  end

  @doc false
  def changeset(registration, attrs) do
    registration
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:status, ["accepted", "pending", "deleted"])
  end
end
