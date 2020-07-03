defmodule WcaLive.Competitions.Person do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Competitions.{Competition, Registration, PersonalBest, Assignment, Result}

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
    has_many :results, Result
  end

  @doc false
  def changeset(person, attrs) do
    person
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:gender, ["m", "f", "o"])
  end

  defimpl WcaLive.Wcif.Type do
    def to_wcif(person) do
      %{
        "registrantId" => person.registrant_id,
        "name" => person.name,
        "wcaUserId" => person.wca_user_id,
        "wcaId" => person.wca_id,
        "countryIso2" => person.country_iso2,
        "gender" => person.gender,
        "birthdate" => person.birthdate |> Date.to_iso8601(),
        "email" => person.email,
        "avatar" =>
          person.avatar_url && person.avatar_thumb_url &&
            %{
              "url" => person.avatar_url,
              "thumbUrl" => person.avatar_thumb_url
            },
        "roles" => person.roles,
        "registration" =>
          person.registration && person.registration |> WcaLive.Wcif.Type.to_wcif(),
        "assignments" => person.assignments |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1),
        "personalBests" => person.personal_bests |> Enum.map(&WcaLive.Wcif.Type.to_wcif/1)
      }
    end
  end
end
