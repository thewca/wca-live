defmodule WcaLive.Scoretaking.Result do
  @moduledoc """
  Represents competitor participation in a single round.

  Consists of multiple attempt results and is assigned
  a ranking by comparison to other results in the given round.
  """

  use WcaLive.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.Person
  alias WcaLive.Scoretaking.{Round, Attempt, AttemptResult, Result, Cutoff}
  alias WcaLive.Wca.Format

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

  def changeset(result, attrs, event_id, format, cutoff) do
    result
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> cast_embed(:attempts)
    |> compute_best_and_average(event_id, format)
    |> validate_required(@required_fields)
    |> validate_length(:attempts, max: format.number_of_attempts)
    |> validate_no_trailing_skipped()
    |> validate_not_all_dns(format, cutoff)
  end

  defp compute_best_and_average(changeset, event_id, format) do
    %{attempts: attempts} = apply_changes(changeset)

    attempt_results =
      attempts
      |> Enum.map(& &1.result)
      |> AttemptResult.pad_skipped(format.number_of_attempts)

    changeset
    |> put_change(:best, AttemptResult.best(attempt_results))
    |> put_change(
      :average,
      if should_compute_average?(event_id, format) do
        AttemptResult.average(attempt_results, event_id)
      else
        AttemptResult.skipped()
      end
    )
  end

  defp validate_no_trailing_skipped(changeset) do
    %{attempts: attempts} = apply_changes(changeset)
    last_attempt = List.last(attempts)

    if last_attempt && AttemptResult.skipped?(last_attempt.result) do
      add_error(changeset, :attempts, "can't have trailing skipped attempt result")
    else
      changeset
    end
  end

  defp validate_not_all_dns(changeset, format, cutoff) do
    %{attempts: attempts} = apply_changes(changeset)
    attempt_results = Enum.map(attempts, & &1.result)

    max_incomplete_attempts =
      if cutoff, do: cutoff.number_of_attempts, else: format.number_of_attempts

    if Enum.all?(attempt_results, &AttemptResult.dns?/1) and
         length(attempt_results) == max_incomplete_attempts do
      add_error(
        changeset,
        :attempts,
        "can't all be DNS, remove the competitor from this round instead"
      )
    else
      changeset
    end
  end

  @doc """
  Returns an empty result changeset.

  Accepts `attrs` for optional changes to include.
  """
  @spec empty_result(keyword()) :: Ecto.Changeset.t()
  def empty_result(attrs \\ []) do
    change(%Result{}, attrs)
  end

  @doc """
  Checks if `result` satisfies `cutoff` and is eligible for further attempts.
  """
  @spec meets_cutoff?(%Result{}, %Cutoff{}) :: boolean()
  def meets_cutoff?(_result, nil), do: true

  def meets_cutoff?(result, cutoff) do
    result.attempts
    |> Enum.take(cutoff.number_of_attempts)
    |> Enum.any?(fn attempt ->
      AttemptResult.better?(attempt.result, cutoff.attempt_result)
    end)
  end

  @doc """
  Checks if `result` has all the attempts it's expected to have.
  """
  @spec has_expected_attempts?(%Result{}, pos_integer(), %Cutoff{}) :: boolean()
  def has_expected_attempts?(result, max_attempts, cutoff) do
    if meets_cutoff?(result, cutoff) do
      length(result.attempts) == max_attempts
    else
      length(result.attempts) == cutoff.number_of_attempts
    end
  end

  @doc """
  Returns `true` if `result` has no attempts.
  """
  @spec empty?(%Result{}) :: boolean()
  def empty?(result), do: result.attempts == []

  @doc """
  Returns a list of result stats (i.e. best and average)
  ordered by significancy.
  """
  @spec ordered_result_stats(String.t(), %Format{}) ::
          list(%{
            name: String.t(),
            field: atom(),
            record_tag_field: atom()
          })
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

  @doc """
  Orders query results in a natural way - by ranking, then person name.
  """
  def order_by_ranking(query) do
    from r in query,
      join: p in assoc(r, :person),
      order_by: [asc_nulls_last: r.ranking, asc: p.name]
  end
end
