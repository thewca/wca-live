defmodule WcaLive.Competitions.CompetitionEvent do
  @moduledoc """
  Corresponds to a WCA event held at a competition.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions
  alias WcaLive.Scoretaking

  @required_fields [:event_id]
  @optional_fields [:competitor_limit]

  schema "competition_events" do
    field :competitor_limit, :integer
    field :event_id, :string

    embeds_one :qualification, Competitions.Qualification, on_replace: :update

    belongs_to :competition, Competitions.Competition
    has_many :rounds, Scoretaking.Round, on_replace: :delete

    many_to_many :registrations, Competitions.Registration,
      join_through: "registration_competition_events"
  end

  def changeset(competition_event, attrs) do
    competition_event
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> cast_embed(:qualification)
    |> validate_required(@required_fields)
  end
end
