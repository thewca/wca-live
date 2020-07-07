defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Wcif
  alias WcaLive.Competitions.{Competition, Round, Person}

  def import(competition_wca_id, user) do
    # TODO: load the data
    wcif = File.read!("/home/jonatanklosko/Downloads/wcif.json") |> Jason.decode!()

    Wcif.Import.import_competition(%Competition{imported_by: user}, wcif)
  end

  def synchronize(competition) do
    # TODO: load the data
    wcif = File.read!("/home/jonatanklosko/Downloads/wcif.json") |> Jason.decode!()

    Wcif.Import.import_competition(competition, wcif)

    # TODO: save synchronized WCIF back to the WCA website (resutls part).
  end

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
  Gets a single round.
  """
  def get_round(id), do: Repo.get(Round, id)

  @doc """
  Gets a single person.
  """
  def get_person(id), do: Repo.get(Person, id)
end
