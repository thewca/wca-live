defmodule WcaLive.Competitions.PersonalBest do
  @moduledoc """
  A personal best single/average in a specific event.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions

  @required_fields [
    :event_id,
    :type,
    :best,
    :world_ranking,
    :continental_ranking,
    :national_ranking
  ]
  @optional_fields []

  schema "personal_bests" do
    field :event_id, :string
    field :type, :string
    field :best, :integer
    field :world_ranking, :integer
    field :continental_ranking, :integer
    field :national_ranking, :integer

    belongs_to :person, Competitions.Person
  end

  def changeset(personal_best, attrs) do
    personal_best
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, ["single", "average"])
  end
end
