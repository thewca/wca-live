defmodule WcaLive.Competitions.Person do
  use WcaLive.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias WcaLive.Competitions.{Competition, Registration, PersonalBest, Assignment, Person}
  alias WcaLive.Scoretaking.Result

  @required_fields [
    :wca_user_id,
    :name,
    :email,
    :birthdate,
    :country_iso2,
    :gender,
    :roles
  ]
  # Note: the WCIF spec requires registrant id, but the WCA website allows null for now.
  # See: https://github.com/thewca/worldcubeassociation.org/blob/fae9a4371db513d296e01415df5b130a703aa58a/WcaOnRails/app/models/user.rb#L1057
  @optional_fields [:registrant_id, :wca_id, :avatar_url, :avatar_thumb_url]

  schema "people" do
    field :wca_user_id, :integer
    field :wca_id, :string
    field :registrant_id, :integer
    field :name, :string
    field :email, :string
    field :birthdate, :date
    field :country_iso2, :string
    field :gender, :string
    field :avatar_url, :string
    field :avatar_thumb_url, :string
    field :roles, {:array, :string}

    belongs_to :competition, Competition
    has_one :registration, Registration, on_replace: :update
    has_many :personal_bests, PersonalBest, on_replace: :delete
    has_many :assignments, Assignment, on_replace: :delete
    has_many :results, Result, on_replace: :delete
  end

  @doc false
  def changeset(person, attrs) do
    person
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:gender, ["m", "f", "o"])
  end

  def competitor?(%Person{registration: %{status: "accepted"}}), do: true
  def competitor?(%Person{registration: %{status: _other}}), do: false
  def competitor?(%Person{registration: nil}), do: false

  def latin_name(person) do
    String.replace(person.name, ~r/\s*[(（].*/, "")
  end

  def where_competitor(query) do
    from p in query,
      join: r in assoc(p, :registration),
      where: r.status == "accepted"
  end
end
