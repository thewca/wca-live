defmodule WcaLive.Scoretaking.Advancing do
  @moduledoc """
  Functions related to determining who qualifies and advances from
  round to round.

  Note that **advancing** competitors mean actually being in the next
  round (the "green" results), whereas **qualifying** competitors are
  those satisfying advancement criteria.
  """

  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.Wca.Format
  alias WcaLive.Scoretaking
  alias WcaLive.Scoretaking.{Round, AdvancementCondition, AttemptResult, Result, Ranking}
  alias WcaLive.Competitions.Person

  @doc """
  Calculates the `advancing` attribute on `round` results and returns
  a changeset including the changes.
  """
  @spec compute_advancing(%Round{}) :: Ecto.Changeset.t(%Round{})
  def compute_advancing(round) do
    round = round |> Repo.preload(:results)
    {advancing_ids, clinched_advancing_ids} = advancing_result_ids(round)

    round.results
    |> Enum.map(fn result ->
      advancing? = result.id in advancing_ids
      clinched? = result.id in clinched_advancing_ids

      Changeset.change(result,
        advancing: advancing?,
        advancing_questionable: advancing? and not clinched?
      )
    end)
    |> Round.put_results_in_round(round)
  end

  defp advancing_result_ids(round) do
    next = round |> Scoretaking.get_next_round() |> Repo.preload(:results)

    if next != nil and Round.open?(next) do
      # If the next round is open use its results to determine who advanced.
      advancing_person_ids = MapSet.new(next.results, & &1.person_id)

      result_ids =
        for result <- round.results,
            result.person_id in advancing_person_ids,
            into: MapSet.new(),
            do: result.id

      {result_ids, result_ids}
    else
      {qualifying_result_ids(round), clinched_qualifying_result_ids(round)}
    end
  end

  @doc """
  Returns a set of result ids in the given round that satisfy advancement
  criteria.
  """
  @spec qualifying_result_ids(%Round{}) :: list(%Result{})
  def qualifying_result_ids(round) do
    round = Repo.preload(round, :results)

    cond do
      not Round.open?(round) ->
        MapSet.new()

      Round.final?(round) ->
        # Mark top 3 in the finals (unless DNFed).
        for result <- round.results,
            result.best > 0 and result.ranking != nil and result.ranking <= 3,
            into: MapSet.new(),
            do: result.id

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
            if rankings == [], do: 1, else: List.last(rankings) + 1
          end

        total_results = length(results)

        for result <- results,
            # Note: this ensures that people who tied either qualify together or not.
            result.ranking != nil and result.ranking < first_non_qualifying_ranking,
            result.best > 0,
            satisfies_advancement_condition?(
              result,
              advancement_condition,
              total_results,
              format
            ),
            into: MapSet.new(),
            do: result.id
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
    previous = round |> Scoretaking.get_previous_round() |> Repo.preload(results: :person)

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

        candidates_to_qualify_ids =
          for result <- previous.results,
              not result.advancing,
              result not in already_quit,
              into: MapSet.new(),
              do: result.id

        # Take already quit results and the first advancing one,
        # then *pretend* they got the worst results and didn't qualify
        # (ended up at the very bottom of results).
        # This way we see who else would advance.
        ignored_results = [first_advancing | already_quit]
        hypothetically_qualifying = qualifying_results_ignoring(previous, ignored_results)

        for result <- hypothetically_qualifying,
            result.id in candidates_to_qualify_ids,
            do: result.person
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

    Enum.filter(results, fn result ->
      # Should advance, but didn't, because they quit the next round.
      result.ranking <= max_advancing_ranking and not result.advancing
    end)
  end

  defp qualifying_results_ignoring(round, ignored_results) do
    ignored_result_ids = MapSet.new(ignored_results, & &1.id)

    # DNF attempts rank ignored people at the end (making sure they don't qualify).
    # Then recompute rankings and see who would qualify as a result.
    hypothetical_results =
      Enum.map(round.results, fn result ->
        if result.id in ignored_result_ids do
          %{result | attempts: [-1], best: -1, average: -1}
        else
          result
        end
      end)

    hypothetical_round =
      %{round | results: hypothetical_results}
      |> Ranking.compute_ranking()
      |> Ecto.Changeset.apply_changes()

    hypothetical_qualifying_ids = qualifying_result_ids(hypothetical_round)

    Enum.filter(round.results, &(&1.id in hypothetical_qualifying_ids))
  end

  defp clinched_qualifying_result_ids(round) do
    # Assume best possible attempts for empty results and see who of
    # the currently entered results would still qualify.

    hypothetical_results =
      Enum.map(round.results, fn result ->
        if result.attempts == [] do
          %{result | attempts: [1, 1, 1, 1, 1], best: 1, average: 1}
        else
          result
        end
      end)

    hypothetical_round =
      %{round | results: hypothetical_results}
      |> Ranking.compute_ranking()
      |> Ecto.Changeset.apply_changes()

    hypothetical_qualifying_ids = qualifying_result_ids(hypothetical_round)

    for result <- round.results,
        result.attempts != [],
        result.id in hypothetical_qualifying_ids,
        into: MapSet.new(),
        do: result.id
  end

  @doc """
  Determines who could be added to `round` (is an advancement candidate).

  Returns a map with the following keys:

    * `:qualifying` - people who could be added to `round`, because
      they qualify

    * `:revocable` - people who are in the round, but would no longer
      qualify if one of the `qualifying` people was added

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

      round_person_ids = MapSet.new(round.results, & &1.person_id)

      qualifying =
        Enum.filter(people, fn person ->
          Person.competitor?(person) and person.id not in round_person_ids
        end)

      %{qualifying: qualifying, revocable: []}
    else
      previous = round |> Scoretaking.get_previous_round() |> Repo.preload(results: :person)

      already_quit = already_quit_results(previous.results)

      could_just_advance =
        previous
        |> qualifying_results_ignoring(already_quit)
        |> Enum.reject(& &1.advancing)

      cond do
        could_just_advance != [] ->
          qualifying = (already_quit ++ could_just_advance) |> Enum.map(& &1.person)
          %{qualifying: qualifying, revocable: []}

        already_quit != [] ->
          # See who wouldn't qualify if we un-quit one person.
          new_qualifying =
            previous
            |> qualifying_results_ignoring(Enum.drop(already_quit, 1))
            |> MapSet.new()

          revocable =
            for result <- previous.results,
                result.advancing,
                result not in new_qualifying,
                do: result.person

          qualifying = Enum.map(already_quit, & &1.person)

          %{qualifying: qualifying, revocable: revocable}

        true ->
          # Everyone qualifying is already in the round.
          %{qualifying: [], revocable: []}
      end
    end
  end
end
