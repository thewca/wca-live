defmodule WcaLive.Competitions.PersonalBest do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.Person

  @required_fields [
    :event_id,
    :type,
    :best,
    :world_ranking,
    :continental_ranking,
    :national_ranking
  ]
  @optional_fields []

  schema "personal_bests" do
    field :event_id, :string
    field :type, :string
    field :best, :integer
    field :world_ranking, :integer
    field :continental_ranking, :integer
    field :national_ranking, :integer

    belongs_to :person, Person
  end

  @doc false
  def changeset(personal_best, attrs) do
    personal_best
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, ["single", "average"])
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(personal_best) do
      %{
        "eventId" => personal_best.event_id,
        "type" => personal_best.type,
        "best" => personal_best.best,
        "worldRanking" => personal_best.world_ranking,
        "continentalRanking" => personal_best.continental_ranking,
        "nationalRanking" => personal_best.national_ranking
      }
    end
  end
end
