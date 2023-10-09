defmodule WcaLive.Scoretaking.Attempt do
  @moduledoc """
  A single attempt done by a competitor during round.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:result]
  @optional_fields [:reconstruction]

  @primary_key false
  embedded_schema do
    field :result, :integer
    field :reconstruction, :string
  end

  def changeset(attempt, attrs) do
    attempt
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_change(:result, fn :result, result ->
      if result < -2 do
        [result: "is out of the expected value range"]
      else
        []
      end
    end)
  end
end
