defmodule WcaLive.Scoretaking.Ranking do
  @moduledoc """
  Functions related to calculating results ranking.
  """

  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.Wca
  alias WcaLive.Scoretaking

  @doc """
  Calculates the `ranking` attribute on `round` results
  and returns a changeset including the changes.
  """
  @spec compute_ranking(%Scoretaking.Round{}) :: Ecto.Changeset.t(%Scoretaking.Round{})
  def compute_ranking(round) do
    round = round |> Repo.preload(:results)
    format = Wca.Format.get_by_id!(round.format_id)

    {empty, nonempty} = Enum.split_with(round.results, &(&1.attempts == []))

    empty_with_ranking = Enum.map(empty, fn result -> {result, nil} end)

    nonempty_with_ranking =
      nonempty
      |> Enum.sort_by(&result_to_monotnic(&1, format.sort_by))
      |> Enum.with_index(1)
      |> Enum.reduce([], fn
        {result, ranking}, [] ->
          [{result, ranking}]

        {result, ranking}, [{prev_result, prev_ranking} | _] = pairs ->
          if results_equal?(result, prev_result, format.sort_by) do
            [{result, prev_ranking} | pairs]
          else
            [{result, ranking} | pairs]
          end
      end)

    (empty_with_ranking ++ nonempty_with_ranking)
    |> Enum.map(fn {result, ranking} ->
      Changeset.change(result, ranking: ranking)
    end)
    |> Scoretaking.Round.put_results_in_round(round)
  end

  defp result_to_monotnic(result, :best = _sort_by) do
    Scoretaking.AttemptResult.to_monotonic(result.best)
  end

  defp result_to_monotnic(result, :average = _sort_by) do
    {Scoretaking.AttemptResult.to_monotonic(result.average),
     Scoretaking.AttemptResult.to_monotonic(result.best)}
  end

  defp results_equal?(result1, result2, sort_by) do
    result_to_monotnic(result1, sort_by) == result_to_monotnic(result2, sort_by)
  end
end
