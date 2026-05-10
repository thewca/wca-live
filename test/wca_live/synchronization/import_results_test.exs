defmodule WcaLive.Synchronization.ImportResultsTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Synchronization.Import
  alias WcaLive.Repo

  test "import_results/3 imports results for an empty round" do
    user = insert(:user)
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition, event_id: "333")
    round = insert(:round, competition_event: competition_event, format_id: "a")
    person = insert(:person, competition: competition, registrant_id: 7)

    wcif =
      build_wcif("333", 1, "a", [
        wcif_result(7, [3232, 3213, 2323, 2323, 2323])
      ])

    assert {:ok, _competition} = Import.import_results(competition, wcif, user)

    [result] = round |> Ecto.assoc(:results) |> Repo.all()

    assert result.person_id == person.id
    assert result.entered_by_id == user.id
    assert result.entered_at != nil
    assert Enum.map(result.attempts, & &1.result) == [3232, 3213, 2323, 2323, 2323]
    assert result.best == 2323
    assert result.average == 2620
    assert result.ranking == 1
  end

  test "import_results/3 skips rounds that already have results" do
    user = insert(:user)
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition, event_id: "333")
    round = insert(:round, competition_event: competition_event, format_id: "a")
    person = insert(:person, competition: competition, registrant_id: 7)

    existing_result =
      insert(:result,
        round: round,
        person: person,
        attempts: build_list(5, :attempt, result: 1000),
        best: 1000,
        average: 1000
      )

    wcif =
      build_wcif("333", 1, "a", [
        wcif_result(7, [3232, 3213, 2323, 2323, 2323])
      ])

    assert {:ok, _competition} = Import.import_results(competition, wcif, user)

    [result] = round |> Ecto.assoc(:results) |> Repo.all()
    assert result.id == existing_result.id
    assert Enum.map(result.attempts, & &1.result) == [1000, 1000, 1000, 1000, 1000]
  end

  test "import_results/3 skips rounds with no WCIF results" do
    user = insert(:user)
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition, event_id: "333")
    round = insert(:round, competition_event: competition_event, format_id: "a")

    wcif = build_wcif("333", 1, "a", [])

    assert {:ok, _competition} = Import.import_results(competition, wcif, user)

    assert [] == round |> Ecto.assoc(:results) |> Repo.all()
  end

  test "import_results/3 recomputes ranking across imported results" do
    user = insert(:user)
    competition = insert(:competition)
    competition_event = insert(:competition_event, competition: competition, event_id: "333")
    round = insert(:round, competition_event: competition_event, format_id: "a")
    person1 = insert(:person, competition: competition, registrant_id: 1)
    person2 = insert(:person, competition: competition, registrant_id: 2)

    wcif =
      build_wcif("333", 1, "a", [
        wcif_result(1, [3000, 3000, 3000, 3000, 3000]),
        wcif_result(2, [2000, 2000, 2000, 2000, 2000])
      ])

    assert {:ok, _competition} = Import.import_results(competition, wcif, user)

    results = round |> Ecto.assoc(:results) |> Repo.all()

    result1 = Enum.find(results, &(&1.person_id == person1.id))
    result2 = Enum.find(results, &(&1.person_id == person2.id))

    assert result1.ranking == 2
    assert result2.ranking == 1
  end

  test "import_results/3 leaves unrelated rounds untouched" do
    user = insert(:user)
    competition = insert(:competition)
    competition_event333 = insert(:competition_event, competition: competition, event_id: "333")
    round333 = insert(:round, competition_event: competition_event333, format_id: "a")
    competition_event444 = insert(:competition_event, competition: competition, event_id: "444")
    round444 = insert(:round, competition_event: competition_event444, format_id: "a")
    person = insert(:person, competition: competition, registrant_id: 7)

    wcif = %{
      "events" => [
        %{
          "id" => "333",
          "rounds" => [
            %{
              "id" => "333-r1",
              "format" => "a",
              "results" => [wcif_result(7, [3000, 3000, 3000, 3000, 3000])]
            }
          ]
        },
        %{
          "id" => "444",
          "rounds" => [
            %{
              "id" => "444-r1",
              "format" => "a",
              "results" => []
            }
          ]
        }
      ]
    }

    assert {:ok, _competition} = Import.import_results(competition, wcif, user)

    assert [%{person_id: person_id}] = round333 |> Ecto.assoc(:results) |> Repo.all()
    assert person_id == person.id
    assert [] == round444 |> Ecto.assoc(:results) |> Repo.all()
  end

  defp build_wcif(event_id, round_number, format_id, results) do
    %{
      "events" => [
        %{
          "id" => event_id,
          "rounds" => [
            %{
              "id" => "#{event_id}-r#{round_number}",
              "format" => format_id,
              "results" => results
            }
          ]
        }
      ]
    }
  end

  defp wcif_result(person_id, attempts) do
    attempt_objects =
      Enum.map(attempts, fn result -> %{"result" => result, "reconstruction" => nil} end)

    %{
      "personId" => person_id,
      "ranking" => nil,
      "attempts" => attempt_objects,
      "best" => 0,
      "average" => 0
    }
  end
end
