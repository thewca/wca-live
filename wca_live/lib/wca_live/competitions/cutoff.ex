defmodule WcaLive.Competitions.Cutoff do
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

  defimpl WcaLive.Wcif.Type do
    def to_wcif(cutoff) do
      %{
        "attemptResult" => cutoff.attempt_result,
        "numberOfAttempts" => cutoff.number_of_attempts
      }
    end
  end
end
