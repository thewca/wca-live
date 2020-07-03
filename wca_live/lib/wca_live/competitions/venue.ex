defmodule WcaLive.Competitions.Venue do
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

  @doc false
  def changeset(venue, attrs) do
    venue
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(venue) do
      %{
        "id" => venue.wcif_id,
        "name" => venue.name,
        "latitudeMicrodegrees" => venue.latitude_microdegrees,
        "longitudeMicrodegrees" => venue.longitude_microdegrees,
        "countryIso2" => venue.country_iso2,
        "timezone" => venue.timezone,
        "rooms" => venue.rooms |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1)
      }
    end
  end
end
