defmodule WcaLive.Scoretaking.AdvancementCondition do
  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:level, :type]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :type, :string
    field :level, :integer
  end

  @doc false
  def changeset(advancement_condition, attrs) do
    advancement_condition
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, ["ranking", "percent", "attemptResult"])
  end
end
