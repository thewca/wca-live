defmodule WcaLive.Competitions.Result do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Person, Round, Attempt, AttemptResult}

  @required_fields []
  @optional_fields []

  schema "results" do
    field :ranking, :integer
    field :best, :integer
    field :average, :integer
    field :average_record_tag, :string
    field :single_record_tag, :string
    field :advancing, :boolean, default: false

    embeds_many :attempts, Attempt, on_replace: :delete

    belongs_to :person, Person
    belongs_to :round, Round

    timestamps()
  end

  @doc false
  def changeset(result, attrs, event_id, number_of_attempts) do
    result
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> cast_embed(:attempts)
    |> compute_best_and_average(event_id, number_of_attempts)
    |> validate_required(@required_fields)
    |> validate_no_trailing_skipped()
  end

  defp validate_no_trailing_skipped(changeset) do
    attempt_changesets = get_change(changeset, :attempts)

    last_attempt_result =
      if attempt_changesets && length(attempt_changesets) > 0 do
        attempt_changesets |> List.last() |> get_change(:result)
      end

    if last_attempt_result && AttemptResult.skipped?(last_attempt_result) do
      add_error(changeset, :attempts, "can't have trailing skipped attempt result")
    else
      changeset
    end
  end

  defp compute_best_and_average(changeset, event_id, number_of_attempts) do
    %{attempts: attempts} = apply_changes(changeset)

    attempt_results =
      attempts
      |> Enum.map(& &1.result)
      |> AttemptResult.pad_skipped(number_of_attempts)

    changeset
    |> put_change(:best, AttemptResult.best(attempt_results))
    |> put_change(:average, AttemptResult.average(attempt_results, event_id))
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
    |> Enum.any?(fn attempt ->
      AttemptResult.better?(attempt.result, cutoff.attempt_result)
    end)
  end

  def has_expected_attempts?(result, max_attempts, cutoff) do
    if meets_cutoff?(result, cutoff) do
      length(result.attempts) == max_attempts
    else
      length(result.attempts) == cutoff.number_of_attempts
    end
  end

  def empty?(result), do: length(result.attempts) == 0
end
