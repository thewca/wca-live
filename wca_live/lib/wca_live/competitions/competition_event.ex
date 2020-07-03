defmodule WcaLive.Competitions.CompetitionEvent do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Competition, Round, Qualification}

  @required_fields [:event_id]
  @optional_fields [:competitor_limit]

  schema "competition_events" do
    field :competitor_limit, :integer
    field :event_id, :string

    embeds_one :qualification, Qualification, on_replace: :update

    belongs_to :competition, Competition
    has_many :rounds, Round, on_replace: :delete
  end

  @doc false
  def changeset(competition_event, attrs) do
    competition_event
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(competition_event) do
      %{
        "id" => competition_event.event_id,
        "competitorLimit" => competition_event.competitor_limit,
        "qualification" =>
          competition_event.qualification &&
            competition_event.qualification |> WcaLive.Wcif.Type.to_wcif(),
        "rounds" => competition_event.rounds |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1)
      }
    end
  end
end
