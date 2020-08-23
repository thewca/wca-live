defmodule WcaLive.Scoretaking.AdvancementCondition do
  @moduledoc """
  A requirement to qualify to the next round of an event.

  There exist three types of advancement condition:

    * `ranking` - Top N competitors.
    * `percent` - Top X% of competitors.
    * `attemptResult` - Competitors with result better than Y - either single or average as per 9p2+.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:level, :type]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :type, :string
    field :level, :integer
  end

  def changeset(advancement_condition, attrs) do
    advancement_condition
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, ["ranking", "percent", "attemptResult"])
  end
end
