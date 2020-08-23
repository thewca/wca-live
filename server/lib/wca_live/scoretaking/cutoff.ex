defmodule WcaLive.Scoretaking.Cutoff do
  @moduledoc """
  Represents an attempt result the competitor needs to beat
  in one of the first phase attempts in order to be eligible
  for the remaining attempts.

  See [regulation 9g](https://www.worldcubeassociation.org/regulations/#9p1) for more details.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:attempt_result, :number_of_attempts]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :attempt_result, :integer
    field :number_of_attempts, :integer
  end

  def changeset(cutoff, attrs) do
    cutoff
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
