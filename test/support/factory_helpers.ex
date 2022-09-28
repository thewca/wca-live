defmodule WcaLive.FactoryHelpers do
  import WcaLive.Factory

  alias WcaLive.Competitions.Person
  alias WcaLive.Scoretaking.Round

  @doc """
  Creates two subsequent rounds of the same event
  with results following the given specification.

  ## Options

    * `:first_round_ranks`
    * `:first_round_advancing_ranks`
    * `:first_round_advancement_condition`

  Returns a map with created structs and utility functions.
  """
  @spec setup_rounds(keyword()) :: %{
          first_round: %Round{},
          second_round: %Round{},
          get_people_by_rank: (integer() -> list(%Person{}))
        }
  def setup_rounds(opts) do
    first_round_ranks = Keyword.fetch!(opts, :first_round_ranks)
    first_round_advancing_ranks = Keyword.fetch!(opts, :first_round_advancing_ranks)
    first_round_advancement_condition = Keyword.fetch!(opts, :first_round_advancement_condition)

    competition = insert(:competition)
    number_of_people = length(first_round_ranks)
    people = insert_list(number_of_people, :person, competition: competition)

    competition_event = insert(:competition_event, competition: competition)

    first_round =
      insert(:round,
        number: 1,
        competition_event: competition_event,
        advancement_condition: first_round_advancement_condition
      )

    second_round =
      insert(:round, number: 2, competition_event: competition_event, advancement_condition: nil)

    people
    |> Enum.zip(first_round_ranks)
    |> Enum.each(fn {person, ranking} ->
      advancing? = ranking in first_round_advancing_ranks

      insert(:result,
        round: first_round,
        person: person,
        ranking: ranking,
        advancing: advancing?,
        best: 1000 + ranking,
        average: 1000 + ranking,
        attempts: build_list(5, :attempt, result: 1000 + ranking)
      )

      if advancing? do
        insert(:result,
          round: second_round,
          person: person
        )
      end
    end)

    get_people_by_rank = fn rank ->
      people
      |> Enum.zip(first_round_ranks)
      |> Enum.filter(fn {_person, ranking} -> ranking == rank end)
      |> Enum.map(&elem(&1, 0))
    end

    %{
      first_round: first_round,
      second_round: second_round,
      get_people_by_rank: get_people_by_rank
    }
  end
end
