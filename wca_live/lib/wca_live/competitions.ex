defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Wcif
  alias WcaLive.Competitions.Competition

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
end
