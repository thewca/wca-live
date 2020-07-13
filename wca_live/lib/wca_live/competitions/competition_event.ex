defmodule WcaLive.Competitions.CompetitionEvent do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Competition, Qualification}
  alias WcaLive.Scoretaking.Round

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
    |> cast_embed(:qualification)
    |> validate_required(@required_fields)
  end
end
