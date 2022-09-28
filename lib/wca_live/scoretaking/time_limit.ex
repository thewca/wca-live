defmodule WcaLive.Scoretaking.TimeLimit do
  @moduledoc """
  Represents a time under which an attempt(s) must be completed.

  See [regulation A1a](https://www.worldcubeassociation.org/regulations/#A1a) for more details.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:centiseconds, :cumulative_round_wcif_ids]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :centiseconds, :integer
    # Note: for now we just store round WCIF ids.
    # For cross-round cumulative time limits it would be better
    # to have actual ids or a separate schema filled during synchronization,
    # but that's most likely an overkill in terms of overall complexity
    # given how rare those are.
    field :cumulative_round_wcif_ids, {:array, :string}
  end

  def changeset(time_limit, attrs) do
    time_limit
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
