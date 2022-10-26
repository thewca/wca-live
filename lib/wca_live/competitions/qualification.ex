defmodule WcaLive.Competitions.Qualification do
  @moduledoc """
  A requirement to qualify for competing in the corresopnding event.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:type, :result_type, :when_date]
  @optional_fields [:level]

  @primary_key false
  embedded_schema do
    field :type, :string
    field :result_type, :string
    field :level, :integer
    field :when_date, :date
  end

  def changeset(qualification, attrs) do
    changeset =
      qualification
      |> cast(attrs, @required_fields ++ @optional_fields)
      |> validate_required(@required_fields)
      |> validate_inclusion(:type, ["attemptResult", "ranking", "anyResult"])
      |> validate_inclusion(:result_type, ["single", "average"])

    if get_field(changeset, :type) in ["attemptResult", "ranking"] do
      validate_required(changeset, [:level])
    else
      changeset
    end
  end
end
