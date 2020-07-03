defmodule WcaLive.Competitions.Activity do
  use WcaLive.Schema
  import Ecto.Changeset
  alias WcaLive.Competitions.{Room, Activity, Assignment, Round}

  @required_fields [:wcif_id, :name, :activity_code, :start_time, :end_time]
  @optional_fields []

  schema "activities" do
    field :wcif_id, :integer
    field :name, :string
    field :activity_code, :string
    field :start_time, :utc_datetime
    field :end_time, :utc_datetime

    belongs_to :room, Room
    belongs_to :activity, Activity
    has_many :activities, Activity, on_replace: :delete
    has_many :assignments, Assignment

    belongs_to :round, Round
  end

  @doc false
  def changeset(activity, attrs) do
    activity
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(activity) do
      %{
        "id" => activity.wcif_id,
        "name" => activity.name,
        "activityCode" => activity.activity_code,
        "startTime" => activity.start_time |> DateTime.to_iso8601(),
        "endTime" => activity.end_time |> DateTime.to_iso8601(),
        "childActivities" => activity.activities |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1)
        # "scrambleSetId" => nil # ignored for now
      }
    end
  end
end
