defmodule WcaLive.Scoretaking.Round do
  use WcaLive.Schema
  import Ecto.Query, warn: false
  import Ecto.Changeset

  alias WcaLive.Competitions.CompetitionEvent
  alias WcaLive.Scoretaking.{AdvancementCondition, Cutoff, Result, Round, TimeLimit}
  alias WcaLive.Wca.Format

  @required_fields [:number, :format_id, :scramble_set_count]
  @optional_fields []

  schema "rounds" do
    field :number, :integer
    field :format_id, :string
    field :scramble_set_count, :integer

    embeds_one :advancement_condition, AdvancementCondition, on_replace: :update
    embeds_one :cutoff, Cutoff, on_replace: :update
    embeds_one :time_limit, TimeLimit, on_replace: :update

    belongs_to :competition_event, CompetitionEvent
    has_one :competition, through: [:competition_event, :competition]
    has_many :results, Result, on_replace: :delete
  end

  @doc false
  def changeset(round, attrs) do
    round
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> cast_embed(:time_limit)
    |> cast_embed(:cutoff)
    |> cast_embed(:advancement_condition)
    |> validate_required(@required_fields)
  end

  @doc false
  def put_results_in_round(results, round) do
    round |> change() |> put_assoc(:results, results)
  end

  @doc """
  Returns a friendly round name.
  """
  def name(%Round{advancement_condition: nil}), do: "Final"
  def name(%Round{number: 1}), do: "First Round"
  def name(%Round{number: 2}), do: "Second Round"
  def name(%Round{number: 3}), do: "Third Round"

  @doc """
  Returns a short label for the round, like regional record tag,
  information whether the round is finished or live, etc.

  *Note: `round` must have `results` loaded.*
  """
  def label(round) do
    round.results
    |> regional_record_tags()
    |> best_record_tag()
    |> case do
      nil ->
        cond do
          finished?(round) -> "Done"
          active?(round) -> "Live"
          true -> nil
        end

      tag ->
        tag
    end
  end

  defp regional_record_tags(results) do
    results
    |> Enum.flat_map(fn result -> [result.average_record_tag, result.single_record_tag] end)
    |> Enum.filter(fn tag -> tag not in [nil, "PB"] end)
    |> Enum.uniq()
  end

  defp best_record_tag(tags) do
    ["WR", "CR", "NR"] |> Enum.find(fn tag -> tag in tags end)
  end

  @doc """
  Checks if the given round is open.

  A round is considered open if it has any results (even blank ones).

  *Note: `round` must have `results` loaded.*
  """
  def open?(round), do: length(round.results) > 0

  @doc """
  Checks if the given round is finished.

  A round is considered finished if all results have the expected
  number of attempts (taking cutoff into account)
  or less than 10% of results is missing and the round is inactive.

  *Note: `round` must have `results` loaded.*
  """
  def finished?(%Round{results: []}), do: false

  def finished?(round) do
    format = Format.get_by_id!(round.format_id)

    unfinished_results =
      round.results
      |> Enum.filter(
        &(not Result.has_expected_attempts?(&1, format.number_of_attempts, round.cutoff))
      )
      |> length()

    total_results = length(round.results)

    unfinished_results == 0 or
      (unfinished_results / total_results < 0.1 and not active?(round))
  end

  @doc """
  Checks if the given round is active.

  A round is considered active if there were at least 3 results entered in the past 15 minutes.

  *Note: `round` must have `results` loaded.*
  """
  def active?(round) do
    recent_updates =
      round.results
      |> Enum.filter(fn result -> length(result.attempts) > 0 end)
      |> Enum.count(fn result ->
        DateTime.diff(DateTime.utc_now(), result.entered_at, :second) <= 15 * 60
      end)

    recent_updates >= 3
  end

  def where_sibling(query, round, offset) do
    from r in query,
      where:
        r.competition_event_id == ^round.competition_event_id and
          r.number == ^(round.number + offset)
  end
end
