defmodule WcaLive.Competitions.Activity do
  @moduledoc """
  An activity taking place in a specified timeframe during the competition.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Room, Activity, Assignment}
  alias WcaLive.Scoretaking.Round

  @required_fields [:wcif_id, :name, :activity_code, :start_time, :end_time]
  @optional_fields []

  schema "activities" do
    field :wcif_id, :integer
    field :name, :string
    field :activity_code, :string
    field :start_time, :utc_datetime
    field :end_time, :utc_datetime

    # Room has many activities and each activity may have more specific
    # child activities, so it's a tree-like structure and to represent
    # it in a relational database each object holds and id of the room/activity above.
    # An activity belongs either to room or to parent activity, not both.
    belongs_to :room, Room
    belongs_to :parent_activity, Activity
    has_many :child_activities, Activity, foreign_key: :parent_activity_id, on_replace: :delete
    has_many :assignments, Assignment

    belongs_to :round, Round
  end

  def changeset(activity, attrs) do
    activity
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
