defmodule WcaLive.Competitions.Result do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Person, Round, Attempt}

  @required_fields [:attempts]
  @optional_fields [:ranking, :best, :average, :average_record_tag, :single_record_tag]

  schema "results" do
    field :ranking, :integer
    field :best, :integer
    field :average, :integer
    field :average_record_tag, :string
    field :single_record_tag, :string

    embeds_many :attempts, Attempt, on_replace: :delete

    belongs_to :person, Person
    belongs_to :round, Round

    timestamps()
  end

  @doc false
  def changeset(result, attrs) do
    result
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(result) do
      %{
        "personId" => result.person.registrant_id,
        "ranking" => result.ranking,
        "attempts" => result.attempts |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1),
        "best" => result.best,
        "average" => result.average
      }
    end
  end

  def meets_cutoff?(_result, nil), do: true

  def meets_cutoff?(result, cutoff) do
    result.attempts
    |> Enum.take(cutoff.number_of_attempts)
    # TODO: use comparator function to account for DNF DNS, etc
    |> Enum.any?(fn attempt -> attempt.result < cutoff.attempt_result end)
  end

  def has_expected_attempts?(result, max_attempts, cutoff) do
    if meets_cutoff?(result, cutoff) do
      length(result.attempts) == max_attempts
    else
      length(result.attempts) == cutoff.number_of_attempts
    end
  end
end
