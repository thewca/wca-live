defmodule WcaLive.Competitions.Qualification do
  @moduledoc """
  A requirement to qualify for competing in the corresopnding event.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:type, :when_date, :level]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :type, :string
    field :when_date, :date
    field :level, :integer
  end

  def changeset(qualification, attrs) do
    qualification
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, ["single", "average", "ranking"])
  end
end
