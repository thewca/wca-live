defmodule WcaLive.Scoretaking.RankingTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Scoretaking.Ranking

  describe "compute_ranking/1 when sorting by average" do
    test "orders by average in the first place" do
      round = insert(:round, format_id: "a")
      result1 = insert(:result, round: round, ranking: nil, best: 1000, average: -1)
      result2 = insert(:result, round: round, ranking: nil, best: 1000, average: 1090)
      result3 = insert(:result, round: round, ranking: nil, best: 950, average: 980)

      changeset = Ranking.compute_ranking(round)

      assert %{
               result3.id => 1,
               result2.id => 2,
               result1.id => 3
             } == round_changeset_to_ranking_map(changeset)
    end

    test "orders by best results with the same average" do
      round = insert(:round, format_id: "a")
      result1 = insert(:result, round: round, ranking: nil, best: 950, average: 980)
      result2 = insert(:result, round: round, ranking: nil, best: 900, average: 980)

      changeset = Ranking.compute_ranking(round)

      assert %{
               result2.id => 1,
               result1.id => 2
             } == round_changeset_to_ranking_map(changeset)
    end

    test "assigns the same ranking to results with the same best and average" do
      round = insert(:round, format_id: "a")
      result1 = insert(:result, round: round, ranking: nil, best: 700, average: 800)
      result2 = insert(:result, round: round, ranking: nil, best: 900, average: 1000)
      result3 = insert(:result, round: round, ranking: nil, best: 700, average: 800)

      changeset = Ranking.compute_ranking(round)

      assert %{
               result1.id => 1,
               result3.id => 1,
               result2.id => 3
             } == round_changeset_to_ranking_map(changeset)
    end
  end

  describe "compute_ranking/1 when sorting by best" do
    test "orders by best in the first place" do
      round = insert(:round, format_id: "3")
      result1 = insert(:result, round: round, ranking: nil, best: 700, average: 800)
      result2 = insert(:result, round: round, ranking: nil, best: 1000, average: -1)
      result3 = insert(:result, round: round, ranking: nil, best: 950, average: 0)

      changeset = Ranking.compute_ranking(round)

      assert %{
               result1.id => 1,
               result3.id => 2,
               result2.id => 3
             } == round_changeset_to_ranking_map(changeset)
    end

    test "assigns the same ranking to results with the same best" do
      round = insert(:round, format_id: "3")
      result1 = insert(:result, round: round, ranking: nil, best: 700, average: 800)
      result2 = insert(:result, round: round, ranking: nil, best: 900, average: 950)
      result3 = insert(:result, round: round, ranking: nil, best: 700, average: -1)

      changeset = Ranking.compute_ranking(round)

      assert %{
               result1.id => 1,
               result3.id => 1,
               result2.id => 3
             } == round_changeset_to_ranking_map(changeset)
    end
  end

  test "compute_ranking/1 assigns nil ranking to empty results" do
    round = insert(:round, format_id: "a")
    result1 = insert(:result, round: round, ranking: nil, best: 0, average: 0, attempts: [])
    result2 = insert(:result, round: round, ranking: nil, best: 900, average: 980)

    changeset = Ranking.compute_ranking(round)

    assert %{
             result2.id => 1,
             result1.id => nil
           } == round_changeset_to_ranking_map(changeset)
  end

  test "compute_ranking/1 handles multiple ties correctly" do
    round = insert(:round, format_id: "a")
    result1 = insert(:result, round: round, ranking: nil, best: 700, average: 800)
    result2 = insert(:result, round: round, ranking: nil, best: 900, average: 1000)
    result3 = insert(:result, round: round, ranking: nil, best: 700, average: 800)
    result4 = insert(:result, round: round, ranking: nil, best: 700, average: 800)

    changeset = Ranking.compute_ranking(round)

    assert %{
             result1.id => 1,
             result3.id => 1,
             result4.id => 1,
             result2.id => 4
           } == round_changeset_to_ranking_map(changeset)
  end

  defp round_changeset_to_ranking_map(changeset) do
    updated_round = apply_changes(changeset)

    Map.new(updated_round.results, fn result ->
      {result.id, result.ranking}
    end)
  end
end
