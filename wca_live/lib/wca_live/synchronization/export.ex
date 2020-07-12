defmodule WcaLive.Synchronization.Export do
  alias WcaLive.Repo
  alias WcaLive.Wcif

  def export_competition(competition) do
    competition
    |> preload_all()
    |> Wcif.Type.to_wcif()
  end

  defp preload_all(competition) do
    competition
    |> Repo.preload(
      competition_events: [rounds: [:competition_event, results: [:person]]],
      venues: [rooms: [activities: [:round, [activities: [:round, [activities: [:round]]]]]]],
      people: [:registration, :personal_bests, [assignments: [:activity]]]
    )
  end
end
