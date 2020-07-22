defmodule WcaLive.Scoretaking.Computation do
  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias WcaLive.Repo
  alias WcaLive.Scoretaking.Computation
  alias WcaLive.Scoretaking

  def process_round_after_results_change(round) do
    Multi.new()
    |> Multi.update(:compute_ranking, fn _ ->
      Computation.Ranking.compute_ranking(round)
    end)
    |> Multi.update(:compute_advancing, fn %{compute_ranking: round} ->
      # Note: advancement usually depends on ranking, that's why we compute it first.
      Computation.Advancing.compute_advancing(round)
    end)
    |> Multi.update(:compute_record_tags, fn %{compute_advancing: round} ->
      competition_event = round |> Ecto.assoc(:competition_event) |> Repo.one!()
      Computation.RecordTags.compute_record_tags(competition_event)
    end)
  end

  def update_round_and_previous_advancing(round_changeset) do
    Multi.new()
    |> Multi.update(:round, round_changeset)
    |> Multi.run(:previous, fn _, %{round: round} ->
      previous = Scoretaking.get_previous_round(round) |> Repo.preload(:results)

      if previous == nil do
        {:ok, nil}
      else
        previous |> Computation.Advancing.compute_advancing() |> Repo.update()
      end
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{round: round}} -> {:ok, round}
      {:error, _, reason, _} -> {:error, reason}
    end
  end
end
