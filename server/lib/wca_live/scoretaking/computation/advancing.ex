defmodule WcaLive.Scoretaking.Computation.Advancing do
  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.Wca.Format
  alias WcaLive.Scoretaking
  alias WcaLive.Scoretaking.{Round, AdvancementCondition, AttemptResult, Result}

  # Note that **advancing** results mean actually being in the
  # next round (the "green" results), whereas **qualifying** results
  # are those satisfying advancement criteria.

  @doc """
  Calculates the `advancing` attribute on `round` results
  and returns a changeset including the changes.
  """
  @spec compute_advancing(%Round{}) :: Ecto.Changeset.t(%Round{})
  def compute_advancing(round) do
    round = round |> Repo.preload(:results)
    advancing = advancing_results(round)

    Enum.map(round.results, fn result ->
      Changeset.change(result, advancing: result in advancing)
    end)
    |> Round.put_results_in_round(round)
  end

  defp advancing_results(round) do
    next = Scoretaking.get_next_round(round) |> Repo.preload(:results)

    if next != nil and Round.open?(next) do
      # If the next round is open use its results to determine who advanced.
      advancing_person_ids = Enum.map(next.results, & &1.person_id)

      Enum.filter(round.results, fn result ->
        result.person_id in advancing_person_ids
      end)
    else
      qualifying_results(round)
    end
  end

  @doc """
  Returns a list of results in the given round
  that satisfy advancement criteria.
  """
  @spec qualifying_results(%Round{}) :: list(%Result{})
  def qualifying_results(%Round{results: []}), do: []

  def qualifying_results(%Round{advancement_condition: nil} = round) do
    # Mark top 3 in the finals (unless DNFed).
    Enum.filter(round.results, fn result ->
      result.best > 0 and result.ranking != nil and result.ranking <= 3
    end)
  end

  def qualifying_results(round) do
    %{results: results, advancement_condition: advancement_condition, format_id: format_id} =
      round

    format = Format.get_by_id!(format_id)

    # See: https://www.worldcubeassociation.org/regulations/#9p1
    max_qualifying = floor(length(results) * 0.75)
    rankings = results |> Enum.map(& &1.ranking) |> Enum.reject(&is_nil/1) |> Enum.sort()

    first_non_qualifying_ranking =
      if length(rankings) > max_qualifying do
        Enum.fetch!(rankings, max_qualifying)
      else
        if Enum.empty?(rankings), do: 1, else: List.last(rankings) + 1
      end

    Enum.filter(results, fn result ->
      # Note: this ensures that people who tied either qualify together or not.
      result.ranking != nil and
        result.ranking < first_non_qualifying_ranking and
        result.best > 0 and
        satisfies_advancement_condition?(result, advancement_condition, length(results), format)
    end)
  end

  defp satisfies_advancement_condition?(
         result,
         %AdvancementCondition{type: "ranking", level: level},
         _total_results,
         _format
       ) do
    result.ranking <= level
  end

  defp satisfies_advancement_condition?(
         result,
         %AdvancementCondition{type: "percent", level: level},
         total_results,
         _format
       ) do
    result.ranking <= floor(total_results * level * 0.01)
  end

  defp satisfies_advancement_condition?(
         result,
         %AdvancementCondition{type: "attemptResult", level: level},
         _total_results,
         format
       ) do
    AttemptResult.better?(Map.get(result, format.sort_by), level)
  end
end
