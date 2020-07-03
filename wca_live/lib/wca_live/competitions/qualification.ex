defmodule WcaLive.Competitions.Qualification do
  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:type, :when, :attempt_result]
  @optional_fields []

  @primary_key false
  embedded_schema do
    field :type, :string
    field :when, :utc_datetime
    field :attempt_result, :integer
  end

  @doc false
  def changeset(qualification, attrs) do
    qualification
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, ["single", "average"])
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(qualification) do
      %{
        "type" => qualification.type,
        "when" => qualification.when |> DateTime.to_iso8601(),
        "attemptResult" => qualification.attempt_result
      }
    end
  end
end
