defmodule WcaLive.Competitions.Round do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Wcif
  alias WcaLive.Competitions.{CompetitionEvent, Result, AdvancementCondition, Cutoff, TimeLimit}

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
    has_many :results, Result
  end

  @doc false
  def changeset(round, attrs) do
    round
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(round) do
      %{
        "id" =>
          %Wcif.ActivityCode.Official{
            event_id: round.competition_event.event_id,
            round_number: round.number
          }
          |> to_string(),
        "format" => round.format_id,
        "timeLimit" => round.time_limit && round.time_limit |> Wcif.Type.to_wcif(),
        "cutoff" => round.cutoff && round.cutoff |> Wcif.Type.to_wcif(),
        "advancementCondition" =>
          round.advancement_condition && round.advancement_condition |> Wcif.Type.to_wcif(),
        "results" => round.results |> Enum.map(&Wcif.Type.to_wcif/1),
        "scrambleSetCount" => round.scramble_set_count
        # "scrambleSets" => [] # ignored for now
      }
    end
  end
end
