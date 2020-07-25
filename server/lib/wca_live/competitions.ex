defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo

  alias WcaLive.Competitions.{Competition, Person}

  @doc """
  Returns the list of projects.
  """
  def list_competitions() do
    Repo.all(Competition)
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
