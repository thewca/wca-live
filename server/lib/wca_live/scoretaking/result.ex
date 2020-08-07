defmodule WcaLive.Scoretaking.Result do
  use WcaLive.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.Person
  alias WcaLive.Scoretaking.{Round, Attempt, AttemptResult, Result}

  @required_fields []
  @optional_fields []

  schema "results" do
    field :ranking, :integer
    field :best, :integer, default: 0
    field :average, :integer, default: 0
    field :average_record_tag, :string
    field :single_record_tag, :string
    field :advancing, :boolean, default: false
    field :entered_at, :utc_datetime

    embeds_many :attempts, Attempt, on_replace: :delete

    belongs_to :person, Person
    belongs_to :round, Round
    belongs_to :entered_by, User

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

  def empty_result(attrs \\ []) do
    change(%Result{}, attrs)
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

  def ordered_result_stats(event_id, format) do
    best_stat = %{name: "Best", field: :best, record_tag_field: :single_record_tag}
    average_name = if format.number_of_attempts == 3, do: "Mean", else: "Average"
    average_stat = %{name: average_name, field: :average, record_tag_field: :average_record_tag}

    if should_compute_average?(event_id, format) do
      case format.sort_by do
        :best -> [best_stat, average_stat]
        :average -> [average_stat, best_stat]
      end
    else
      [best_stat]
    end
  end

  defp should_compute_average?("333mbf", _format), do: false

  defp should_compute_average?(_event_id, %{number_of_attempts: number_of_attempts}) do
    number_of_attempts in [3, 5]
  end

  def order_by_ranking(query) do
    from r in query,
      join: p in assoc(r, :person),
      order_by: [asc_nulls_last: r.ranking, asc: p.name]
  end
end
