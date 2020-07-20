defmodule WcaLive.Scoretaking.Cutoff do
  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:attempt_result, :number_of_attempts]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :attempt_result, :integer
    field :number_of_attempts, :integer
  end

  @doc false
  def changeset(cutoff, attrs) do
    cutoff
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
