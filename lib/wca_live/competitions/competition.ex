defmodule WcaLive.Competitions.Competition do
  @moduledoc """
  An official WCA competition imported from the WCA website.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.User
  alias WcaLive.Competitions
  alias WcaLive.Competitions.Activity
  alias WcaLive.Competitions.Competition
  alias WcaLive.Scoretaking
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
  @optional_fields [:competitor_limit]

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

    belongs_to :imported_by, User
    has_many :competition_events, Competitions.CompetitionEvent, on_replace: :delete
    has_many :venues, Competitions.Venue, on_replace: :delete
    has_many :people, Competitions.Person, on_replace: :delete

    has_many :staff_members, Competitions.StaffMember, on_replace: :delete

    timestamps()
  end

  def changeset(competition, attrs) do
    competition
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> unique_constraint(:wca_id)
  end

  @doc """
  Same as `find_activity_by_wcif_id/2`, raises an error if no activity is found.
  """
  @spec find_activity_by_wcif_id!(%Competition{}, integer()) :: %Activity{}
  def find_activity_by_wcif_id!(competition, wcif_id) do
    case find_activity_by_wcif_id(competition, wcif_id) do
      nil -> raise ArgumentError, message: "activity with WCIF id '#{wcif_id}' not found"
      activity -> activity
    end
  end

  @doc """
  Looks up competition activity with matching `wcif_id`.

  *Note: `competition` must have all the schedule associations
  loaded (all way down to the activities).*
  """
  @spec find_activity_by_wcif_id(%Competition{}, integer()) :: %Activity{} | nil
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

  def find_activity_by_wcif_id(%Activity{child_activities: child_activities}, wcif_id) do
    child_activities |> Enum.find_value(&find_activity_by_wcif_id(&1, wcif_id))
  end

  @doc """
  Looks up competition round corresponding to the given `activity_code`.

  *Note: `competition` must have competition events and rounds loaded.*
  """
  @spec find_round_by_activity_code(%Competition{}, String.t() | Wcif.ActivityCode.t()) ::
          %Scoretaking.Round{}
  def find_round_by_activity_code(competition, activity_code) when is_binary(activity_code) do
    find_round_by_activity_code(competition, Wcif.ActivityCode.parse!(activity_code))
  end

  def find_round_by_activity_code(competition, %{event_id: event_id, round_number: round_number}) do
    competition_event = Enum.find(competition.competition_events, &(&1.event_id == event_id))

    if competition_event do
      Enum.find(competition_event.rounds, &(&1.number == round_number))
    end
  end

  def find_round_by_activity_code(_competition, _activity_code), do: nil

  @doc """
  Returns `true` if `competition` is in the past according to its schedule.
  """
  @spec over?(%Competition{}) :: boolean()
  def over?(competition) do
    DateTime.compare(DateTime.utc_now(), competition.end_time) == :gt
  end
end
