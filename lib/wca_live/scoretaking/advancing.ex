defmodule WcaLive.Scoretaking.Advancing do
  @moduledoc """
  Functions related to determining who
  qualifies and advances from round to round.

  Note that **advancing** competitors mean actually being in the
  next round (the "green" results), whereas **qualifying** competitors
  are those satisfying advancement criteria.
  """

  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.Wca.Format
  alias WcaLive.Scoretaking
  alias WcaLive.Scoretaking.{Round, AdvancementCondition, AttemptResult, Result, Ranking}
  alias WcaLive.Competitions.Person

  @doc """
  Calculates the `advancing` attribute on `round` results
  and returns a changeset including the changes.
  """
  @spec compute_advancing(%Round{}) :: Ecto.Changeset.t(%Round{})
  def compute_advancing(round) do
    round = round |> Repo.preload(:results)
    {advancing, clinched_advancing} = advancing_results(round)

    Enum.map(round.results, fn result ->
      advancing = result in advancing

      Changeset.change(result,
        advancing: advancing,
        advancing_questionable: advancing and result not in clinched_advancing
      )
    end)
    |> Round.put_results_in_round(round)
  end

  defp advancing_results(round) do
    next = Scoretaking.get_next_round(round) |> Repo.preload(:results)

    if next != nil and Round.open?(next) do
      # If the next round is open use its results to determine who advanced.
      advancing_person_ids = Enum.map(next.results, & &1.person_id)

      results =
        Enum.filter(round.results, fn result ->
          result.person_id in advancing_person_ids
        end)

      {results, results}
    else
      {qualifying_results(round), clinched_qualifying_results(round)}
    end
  end

  @doc """
  Returns a list of results in the given round
  that satisfy advancement criteria.
  """
  @spec qualifying_results(%Round{}) :: list(%Result{})
  def qualifying_results(round) do
    round = round |> Repo.preload(:results)

    cond do
      not Round.open?(round) ->
        []

      Round.final?(round) ->
        # Mark top 3 in the finals (unless DNFed).
        Enum.filter(round.results, fn result ->
          result.best > 0 and result.ranking != nil and result.ranking <= 3
        end)

      true ->
        %{results: results, advancement_condition: advancement_condition} = round
        format = Format.get_by_id!(round.format_id)

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
            satisfies_advancement_condition?(
              result,
              advancement_condition,
              length(results),
              format
            )
        end)
    end
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

  @doc """
  Returns a list of people who would qualify to `round`, if one person quit `round`.
  """
  @spec next_qualifying_to_round(%Round{}) :: list(%Person{})
  def next_qualifying_to_round(round) do
    previous = Scoretaking.get_previous_round(round) |> Repo.preload(results: :person)

    cond do
      previous == nil ->
        # Given a first round, so there is no *next* person who qualifies to it.
        []

      not Enum.any?(previous.results, & &1.advancing) ->
        # This is only possible if the given round has no results (not open yet)
        # and no one from the previous round satisfies the advancement condition.
        # In this case there is no one who could qualify.
        []

      true ->
        already_quit = already_quit_results(previous.results)

        first_advancing =
          previous.results |> Enum.filter(& &1.advancing) |> Enum.min_by(& &1.ranking)

        candidates_to_qualify =
          Enum.filter(previous.results, fn result ->
            not result.advancing and result not in already_quit
          end)

        # Take already quit results and the first advancing one,
        # then *pretend* they got the worst results and didn't qualify
        # (ended up at the very bottom of results).
        # This way we see who else would advance.
        ignored_results = [first_advancing | already_quit]
        hypothetically_qualifying = qualifying_results_ignoring(previous, ignored_results)

        hypothetically_qualifying
        |> Enum.filter(fn result -> result in candidates_to_qualify end)
        |> Enum.map(& &1.person)
    end
  end

  # Returns results that quit the next round by looking at the "gaps" in advancement.
  # Note: if the last advancing result quits then this approach doesn't detect it,
  # but it's still pretty much the best heuristic. We could compare qualifying and advancing results,
  # but this wouldn't work when many results quit.
  defp already_quit_results(results) do
    max_advancing_ranking =
      results
      |> Enum.filter(& &1.advancing)
      |> Enum.map(& &1.ranking)
      |> Enum.max()

    results
    # Should advance...
    |> Enum.filter(fn result -> result.ranking <= max_advancing_ranking end)
    # ...but didn't, because they quit the next round.
    |> Enum.filter(fn result -> not result.advancing end)
  end

  defp qualifying_results_ignoring(round, ignored_results) do
    # DNF attempts rank ignored people at the end (making sure they don't qualify).
    # Then recompute rankings and see who would qualify as a result.
    hypothetical_results =
      Enum.map(round.results, fn result ->
        if result in ignored_results do
          %{result | attempts: [-1], best: -1, average: -1}
        else
          result
        end
      end)

    hypothetical_round =
      %{round | results: hypothetical_results}
      |> Ranking.compute_ranking()
      |> Ecto.Changeset.apply_changes()

    qualifying_results(hypothetical_round)
    |> Enum.map(fn hypothetical_result ->
      Enum.find(round.results, &(&1.id == hypothetical_result.id))
    end)
  end

  defp clinched_qualifying_results(round) do
    # Assume best possible attempts for empty results and see who of
    # the currently entered results would still qualify.

    {ranked_results, unranked_results} = Enum.split_with(round.results, & &1.ranking)

    hypothetical_results =
      Enum.map(round.results, fn result ->
        if result in unranked_results do
          %{result | attempts: [1, 1, 1, 1, 1], best: 1, average: 1}
        else
          result
        end
      end)

    hypothetical_round =
      %{round | results: hypothetical_results}
      |> Ranking.compute_ranking()
      |> Ecto.Changeset.apply_changes()

    qualifying_results(hypothetical_round)
    |> Enum.map(fn hypothetical_result ->
      Enum.find(ranked_results, &(&1.id == hypothetical_result.id))
    end)
  end

  @doc """
  Determines who could be added to `round` (is an advancement candidate).

  Returns a map with the following keys:

    * `:qualifying` - People who could be added to `round`, because they qualify.
    * `:revocable` - People who are in the round, but would no longer qualify if one of the `qualifying` people was added.
  """
  @spec advancement_candidates(%Round{}) :: %{
          qualifying: list(%Person{}),
          revocable: list(%Person{})
        }
  def advancement_candidates(round) do
    round = round |> Repo.preload(:results)

    if round.number == 1 do
      # Anyone qualifies to the first round.

      people =
        round
        |> Ecto.assoc([:competition_event, :competition, :people])
        |> Repo.all()
        |> Repo.preload(:registration)

      qualifying =
        people
        |> Enum.filter(&Person.competitor?/1)
        |> Enum.reject(fn person ->
          Enum.any?(round.results, fn result -> result.person_id == person.id end)
        end)

      %{qualifying: qualifying, revocable: []}
    else
      previous = Scoretaking.get_previous_round(round) |> Repo.preload(results: :person)

      already_quit = already_quit_results(previous.results)

      could_just_advance =
        qualifying_results_ignoring(previous, already_quit)
        |> Enum.reject(& &1.advancing)

      cond do
        not Enum.empty?(could_just_advance) ->
          qualifying = (already_quit ++ could_just_advance) |> Enum.map(& &1.person)
          %{qualifying: qualifying, revocable: []}

        not Enum.empty?(already_quit) ->
          # See who wouldn't qualify if we un-quit one person.
          new_qualifying = qualifying_results_ignoring(previous, Enum.drop(already_quit, 1))

          revocable =
            previous.results
            |> Enum.filter(& &1.advancing)
            |> Enum.filter(fn result -> result not in new_qualifying end)
            |> Enum.map(& &1.person)

          qualifying = already_quit |> Enum.map(& &1.person)
          %{qualifying: qualifying, revocable: revocable}

        true ->
          # Everyone qualifying is already in the round.
          %{qualifying: [], revocable: []}
      end
    end
  end
end
