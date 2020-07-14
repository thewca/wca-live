defmodule WcaLive.Competitions.Competition do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.{Competition, Venue, Person, CompetitionEvent, Activity, StaffMember}
  alias WcaLive.Wcif

  @required_fields [
    :wca_id,
    :name,
    :short_name,
    :end_date,
    :start_date,
    :end_time,
    :start_time
  ]
  @optional_fields [:competitor_limit, :encrypted_password]

  schema "competitions" do
    field :wca_id, :string
    field :name, :string
    field :short_name, :string
    field :start_date, :date
    field :end_date, :date
    field :start_time, :utc_datetime
    field :end_time, :utc_datetime
    field :competitor_limit, :integer
    field :synchronized_at, :utc_datetime
    field :encrypted_password, :string

    belongs_to :imported_by, User
    has_many :competition_events, CompetitionEvent, on_replace: :delete
    has_many :venues, Venue, on_replace: :delete
    has_many :people, Person, on_replace: :delete

    has_many :staff_members, StaffMember, on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(competition, attrs) do
    competition
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> unique_constraint(:wca_id)
  end

  def find_activity_by_wcif_id!(competition, wcif_id) do
    case find_activity_by_wcif_id(competition, wcif_id) do
      nil -> raise ArgumentError, message: "Activity with WCIF id \"#{wcif_id}\" not found."
      activity -> activity
    end
  end

  def find_activity_by_wcif_id(%Competition{} = competition, wcif_id) do
    competition.venues
    |> Enum.find_value(fn venue ->
      venue.rooms
      |> Enum.find_value(fn room ->
        room.activities
        |> Enum.find_value(&find_activity_by_wcif_id(&1, wcif_id))
      end)
    end)
  end

  def find_activity_by_wcif_id(%Activity{wcif_id: wcif_id} = activity, wcif_id), do: activity

  def find_activity_by_wcif_id(%Activity{activities: activities}, wcif_id) do
    activities |> Enum.find_value(&find_activity_by_wcif_id(&1, wcif_id))
  end

  def find_round_by_activity_code(competition, activity_code) when is_binary(activity_code) do
    find_round_by_activity_code(competition, Wcif.ActivityCode.parse!(activity_code))
  end

  def find_round_by_activity_code(competition, activity_code) do
    if Wcif.ActivityCode.round?(activity_code) do
      %{event_id: event_id, round_number: round_number} = activity_code
      competition_event = competition.competition_events |> Enum.find(&(&1.event_id == event_id))
      competition_event.rounds |> Enum.find(&(&1.number == round_number))
    else
      nil
    end
  end
end
