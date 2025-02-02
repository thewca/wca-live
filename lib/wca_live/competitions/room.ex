defmodule WcaLive.Competitions.Room do
  @moduledoc """
  A physical or virtual room at a competition.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions

  @required_fields [:wcif_id, :name, :color]
  @optional_fields []

  schema "rooms" do
    field :wcif_id, :integer
    field :name, :string
    field :color, :string

    belongs_to :venue, Competitions.Venue
    has_many :activities, Competitions.Activity, on_replace: :delete
  end

  def changeset(room, attrs) do
    room
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
