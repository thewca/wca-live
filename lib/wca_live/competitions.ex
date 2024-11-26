defmodule WcaLive.Competitions do
  @moduledoc """
  Context for competition management.
  """

  import Ecto.Query, warn: false

  alias WcaLive.Repo
  alias WcaLive.Competitions.{Competition, Person}

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
  Gets a single competition.
  """
  @spec get_competition(term()) :: %Competition{} | nil
  def get_competition(id), do: Repo.get(Competition, id)

  @doc """
  Gets a single competition by human-readable WCA id.

  Raises an error if no competition is found..
  """
  @spec get_competition_by_wca_id!(String.t()) :: %Competition{}
  def get_competition_by_wca_id!(wca_id), do: Repo.get_by!(Competition, wca_id: wca_id)

  @doc """
  Gets a single competition by human-readable WCA id.

  Does not raise an error if no competition is found.
  """
  @spec find_competition_by_wca_id(String.t()) :: %Competition{}
  def find_competition_by_wca_id(wca_id), do: Repo.get_by(Competition, wca_id: wca_id)

  @doc """
  Gets a single competition.
  """
  @spec fetch_competition(term()) :: {:ok, %Competition{}} | {:error, Ecto.Queryable.t()}
  def fetch_competition(id), do: Repo.fetch(Competition, id)

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
end
