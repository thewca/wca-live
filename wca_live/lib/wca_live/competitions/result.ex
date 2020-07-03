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
end
