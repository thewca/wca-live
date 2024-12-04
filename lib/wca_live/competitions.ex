defmodule WcaLive.Competitions do
  @moduledoc """
  Context for competition management.
  """

  import Ecto.Query, warn: false

  alias WcaLive.Repo
  alias WcaLive.Competitions.{Competition, Person}

  @competition_deletable_after_days 180

  @doc """
  Returns a list of competitions.

  Takes a map with the following optional arguments:

    * `:limit` - The maximum number of users to return.
    * `:filter` - A query string to filter the results by.
    * `:from` - A `Date` at/after which competitions should be considered.
  """
  @spec list_competitions(map()) :: list(%Competition{})
  def list_competitions(args \\ %{}) do
    Competition
    |> maybe_limit(args[:limit])
    |> filter_by_text(args[:filter])
    |> where_start_date_gte(args[:from])
    |> Repo.all()
  end

  defp maybe_limit(query, nil), do: query

  defp maybe_limit(query, limit) do
    from c in query, limit: ^limit
  end

  defp filter_by_text(query, nil), do: query

  defp filter_by_text(query, filter) do
    from c in query, where: ilike(c.name, ^"%#{filter}%")
  end

  defp where_start_date_gte(query, nil), do: query

  defp where_start_date_gte(query, from) do
    from c in query, where: c.start_date >= ^from
  end

  @doc """
  Gets a single competition by numeric id.
  """
  @spec get_competition(term()) :: %Competition{} | nil
  def get_competition(id), do: Repo.get(Competition, id)

  @doc """
  Gets a single competition by human-readable WCA id.

  Raises an error if no competition is found..
  """
  @spec get_competition_by_wca_id!(String.t()) :: %Competition{}
  def get_competition_by_wca_id!(wca_id), do: Repo.get_by!(Competition, wca_id: wca_id)

  @spec fetch_competition(any()) :: {:error, any()} | {:ok, %{optional(atom()) => any()}}
  @doc """
  Gets a single competition
  """
  @spec fetch_competition(term()) :: {:ok, %Competition{}} | {:error, Ecto.Queryable.t()}
  def fetch_competition(id), do: Repo.fetch(Competition, id)

  @doc """
  Gets a single competition by WCA id.
  """
  @spec fetch_competition_by_wca_id(String.t()) ::
          {:ok, %Competition{}} | {:error, Ecto.Queryable.t()}
  def fetch_competition_by_wca_id(id) do
    Repo.fetch(where(Competition, wca_id: ^id))
  end

  @doc """
  Gets a single person.
  """
  @spec get_person(term()) :: %Person{} | nil
  def get_person(id), do: Repo.get(Person, id)

  @doc """
  Gets a single person.
  """
  @spec fetch_person(term()) :: {:ok, %Person{}} | {:error, Ecto.Queryable.t()}
  def fetch_person(id), do: Repo.fetch(Person, id)

  @doc """
  Finds person by competition-scoped registrant id.
  """
  @spec get_person_by_registrant_id!(term(), pos_integer()) :: %Person{}
  def get_person_by_registrant_id!(competition_id, registrant_id) do
    Repo.one!(
      from person in Person,
        where: person.competition_id == ^competition_id and person.registrant_id == ^registrant_id
    )
  end

  @doc """
  Finds person by WCA ID.
  """
  @spec get_person_by_wca_id!(term(), String.t()) :: %Person{}
  def get_person_by_wca_id!(competition_id, wca_id) do
    Repo.one!(
      from person in Person,
        where: person.competition_id == ^competition_id and person.wca_id == ^wca_id
    )
  end

  @doc """
  Updates `competition` with `attrs`.

  Attributes may include nested `staff_members`.
  """
  @spec update_competition(%Competition{}, map()) ::
          {:ok, %Competition{}} | {:error, Ecto.Changeset.t()}
  def update_competition(competition, attrs) do
    competition
    |> Repo.preload(:staff_members)
    |> Competition.changeset(attrs)
    |> Ecto.Changeset.cast_assoc(:staff_members)
    |> Repo.update()
  end

  @doc """
  Deletes all competitions from before #{@competition_deletable_after_days}
  days ago.

  Returns the number of deleted competitions.
  """
  @spec delete_old_competitions() :: non_neg_integer()
  def delete_old_competitions() do
    date = Date.utc_today() |> Date.add(-@competition_deletable_after_days)

    {count, _} =
      Repo.delete_all(
        from competition in Competition,
          where: competition.end_date < ^date
      )

    count
  end

  @doc """
  Anonymizes personal data corresponding to the given WCA ID across
  all competitions.

  Returns the number of anonymized competitions.
  """
  @spec anonymize_person(String.t()) :: {:ok, non_neg_integer()}
  def anonymize_person(wca_id) do
    {count, _} =
      from(Person, where: [wca_id: ^wca_id])
      |> Repo.update_all(
        set: [
          name: "Anonymous",
          wca_id: "2000ANON01",
          country_iso2: "US",
          gender: "o",
          email: "anonymous@worldcubeassociation.org",
          avatar_url: nil
        ]
      )

    {:ok, count}
  end
end
