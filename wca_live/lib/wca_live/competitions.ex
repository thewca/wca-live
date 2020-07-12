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
  def get_competition!(id), do: Repo.get!(Competition, id)

  @doc """
  Gets a single person.
  """
  def get_person(id), do: Repo.get(Person, id)
end
