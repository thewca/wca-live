defmodule WcaLive.Competitions.Room do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Venue, Activity}

  @required_fields [:wcif_id, :name, :color]
  @optional_fields []

  schema "rooms" do
    field :wcif_id, :integer
    field :name, :string
    field :color, :string

    belongs_to :venue, Venue
    has_many :activities, Activity, on_replace: :delete
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(room) do
      %{
        "id" => room.wcif_id,
        "name" => room.name,
        "color" => room.color,
        "activities" => room.activities |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1)
      }
    end
  end
end
