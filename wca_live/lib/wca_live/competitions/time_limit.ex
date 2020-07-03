defmodule WcaLive.Competitions.TimeLimit do
  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:centiseconds, :cumulative_round_wcif_ids]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :centiseconds, :integer
    field :cumulative_round_wcif_ids, {:array, :string}
  end

  @doc false
  def changeset(time_limit, attrs) do
    time_limit
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(time_limit) do
      %{
        "centiseconds" => time_limit.centiseconds,
        "cumulativeRoundIds" => time_limit.cumulative_round_wcif_ids
      }
    end
  end
end
