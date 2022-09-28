defmodule WcaLive.Competitions.Venue do
  @moduledoc """
  A physical place where the competition takes place.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Competition, Room}

  @required_fields [
    :wcif_id,
    :name,
    :latitude_microdegrees,
    :longitude_microdegrees,
    :country_iso2,
    :timezone
  ]
  @optional_fields []

  schema "venues" do
    field :wcif_id, :integer
    field :name, :string
    field :latitude_microdegrees, :integer
    field :longitude_microdegrees, :integer
    field :country_iso2, :string
    field :timezone, :string

    belongs_to :competition, Competition
    has_many :rooms, Room, on_replace: :delete
  end

  def changeset(venue, attrs) do
    venue
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
