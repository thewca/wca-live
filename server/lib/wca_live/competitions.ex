defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo

  alias WcaLive.Competitions.{Competition, Person}

  @doc """
  Returns the list of competitions.
  """
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
  def get_competition(id), do: Repo.get(Competition, id)

  @doc """
  Gets a single competition.
  """
  def fetch_competition(id), do: Repo.fetch(Competition, id)

  @doc """
  Gets a single person.
  """
  def get_person(id), do: Repo.get(Person, id)

  @doc """
  Gets a single person.
  """
  def fetch_person(id), do: Repo.fetch(Person, id)

  def update_competition(competition, attrs) do
    competition
    |> Repo.preload(:staff_members)
    |> Competition.changeset(attrs)
    |> Ecto.Changeset.cast_assoc(:staff_members)
    |> Repo.update()
  end
end
