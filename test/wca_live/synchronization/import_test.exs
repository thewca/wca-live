defmodule WcaLive.Synchronization.ImportTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Competitions.Competition
  alias WcaLive.Synchronization.Import
  alias WcaLive.Synchronization.Export
  alias WcaLive.Repo

  @wcif %{
    "formatVersion" => "2.2",
    "id" => "WC2019",
    "name" => "WCA World Championship 2019",
    "shortName" => "WCA WC 2019",
    # TODO: import competition series
    "series" => nil,
    "persons" => [
      %{
        "registrantId" => 1,
        "name" => "Sherlock Holmes",
        "wcaUserId" => 221,
        "wcaId" => "2015HOLM01",
        "countryIso2" => "GB",
        "gender" => "m",
        "birthdate" => "1854-06-20",
        "email" => "sholmes@gmail.com",
        "avatar" => %{
          "url" => "https://path.to/avatar",
          "thumbUrl" => "https://path.to/avatar/thumbnail"
        },
        "roles" => ["delegate"],
        "registration" => %{
          "wcaRegistrationId" => 1,
          "eventIds" => ["333"],
          "status" => "accepted",
          "guests" => 2,
          "comments" => "I would like to opt-in for the pizza."
        },
        "assignments" => [
          %{
            "activityId" => 1,
            "assignmentCode" => "competitor",
            "stationNumber" => nil
          }
        ],
        "personalBests" => [
          %{
            "eventId" => "333",
            "value" => 790,
            "type" => "single",
            "worldRanking" => 995,
            "continentalRanking" => 105,
            "nationalRanking" => 6
          },
          %{
            "eventId" => "333",
            "value" => 855,
            "type" => "average",
            "worldRanking" => 590,
            "continentalRanking" => 78,
            "nationalRanking" => 2
          }
        ]
      }
    ],
    "events" => [
      %{
        "id" => "333",
        "rounds" => [
          %{
            "id" => "333-r1",
            "format" => "a",
            "timeLimit" => %{
              "centiseconds" => 18000,
              "cumulativeRoundIds" => []
            },
            "cutoff" => %{
              "numberOfAttempts" => 2,
              "resultValue" => 3000
            },
            "linkedRounds" => nil,
            "participationRuleset" => %{
              "participationSource" => %{"type" => "registrations"},
              "reservedPlaces" => nil
            },
            "results" => [],
            "scrambleSetCount" => 4,
            # Ignored until WCA API supports it
            # "scrambleSets" => [],
            "extensions" => []
          }
        ],
        "competitorLimit" => nil,
        "qualification" => %{
          "resultCondition" => %{"type" => "ranking", "scope" => "average", "value" => 50},
          "latestResultDate" => "2019-07-01",
          "earliestResultDate" => nil
        },
        "extensions" => []
      }
    ],
    "schedule" => %{
      "startDate" => "2019-07-13",
      "numberOfDays" => 2,
      "venues" => [
        %{
          "id" => 1,
          "name" => "Melbourne Convention and Exhibition Centre",
          "latitudeMicrodegrees" => -37_825_214,
          "longitudeMicrodegrees" => 144_952_280,
          "countryIso2" => "AU",
          "timezone" => "Australia/Melbourne",
          "rooms" => [
            %{
              "id" => 1,
              "name" => "Main stage",
              "color" => "#00aeff",
              "activities" => [
                %{
                  "id" => 1,
                  "name" => "3x3x3 Cube, Round 1",
                  "activityCode" => "333-r1",
                  "startTime" => "2019-07-13T05:20:00Z",
                  "endTime" => "2019-07-13T08:00:00Z",
                  "childActivities" => [],
                  # Ignored until WCA API supports it
                  # "scrambleSetId" => 1,
                  "extensions" => []
                }
              ],
              "extensions" => []
            }
          ],
          "extensions" => []
        }
      ]
    },
    "competitorLimit" => 1000,
    "extensions" => []
  }

  test "import_competition/2 given a blank competition struct creates a new competition" do
    user = insert(:user)

    competition = %Competition{imported_by: user}

    assert {:ok, competition} = Import.import_competition(competition, @wcif)
    assert "WC2019" == competition.wca_id
    assert "WCA World Championship 2019" == competition.name
    assert ~D[2019-07-13] == competition.start_date
    assert ~D[2019-07-14] == competition.end_date
    assert ~U[2019-07-13 05:20:00Z] == competition.start_time
    assert ~U[2019-07-13 08:00:00Z] == competition.end_time
  end

  test "import_competition/2 given an existing competition updates it" do
    competition = insert(:competition, wca_id: "WC2019", name: "Some Name 2020")

    assert {:ok, competition} = Import.import_competition(competition, @wcif)
    assert "WC2019" == competition.wca_id
    assert "WCA World Championship 2019" == competition.name
  end

  for {type, internal_type} <- [
        {"ranking", "ranking"},
        {"percent", "percent"},
        {"resultAchieved", "attemptResult"}
      ] do
    test "import/export maps #{type} advancement to the destination round" do
      [event] = @wcif["events"]
      [first] = event["rounds"]
      first = %{first | "format" => "3"}

      second = %{
        first
        | "id" => "333-r2",
          "format" => "a",
          "cutoff" => nil,
          "participationRuleset" => %{
            "participationSource" => %{
              "type" => "round",
              "roundId" => "333-r1",
              "resultCondition" => %{"type" => unquote(type), "scope" => "single", "value" => 50}
            },
            "reservedPlaces" => nil
          }
      }

      third = %{
        second
        | "id" => "333-r3",
          "participationRuleset" => %{
            "participationSource" => %{
              "type" => "round",
              "roundId" => "333-r2",
              "resultCondition" => %{"type" => unquote(type), "scope" => "average", "value" => 10}
            },
            "reservedPlaces" => nil
          }
      }

      # Round ordering in the incoming JSON must not determine advancement.
      wcif = put_in(@wcif, ["events", Access.at(0), "rounds"], [third, first, second])
      competition = insert(:competition, wca_id: "WC2019")

      assert {:ok, competition} = Import.import_competition(competition, wcif)

      event =
        competition |> Ecto.assoc(:competition_events) |> Repo.one!() |> Repo.preload(:rounds)

      [round1, round2, round3] = Enum.sort_by(event.rounds, & &1.number)
      assert round1.advancement_condition.type == unquote(internal_type)
      assert round1.advancement_condition.level == 50
      assert round2.advancement_condition.level == 10
      assert round3.advancement_condition == nil

      [exported_event] = Export.export_competition(competition)["events"]

      assert exported_event["rounds"] ==
               [first, second, third] |> Enum.map(&Map.delete(&1, "extensions"))
    end
  end

  for {type, value, internal_type} <- [
        {"ranking", 50, "ranking"},
        {"resultAchieved", 1000, "attemptResult"},
        {"resultAchieved", nil, "anyResult"}
      ] do
    test "#{internal_type} qualification and dates survive import/export" do
      competition = insert(:competition, wca_id: "WC2019")

      qualification = %{
        "resultCondition" => %{
          "type" => unquote(type),
          "scope" => "single",
          "value" => unquote(value)
        },
        "latestResultDate" => "2019-07-01",
        "earliestResultDate" => "2018-01-01"
      }

      wcif = put_in(@wcif, ["events", Access.at(0), "qualification"], qualification)
      assert {:ok, competition} = Import.import_competition(competition, wcif)
      event = competition |> Ecto.assoc(:competition_events) |> Repo.one!()
      assert event.qualification.type == unquote(internal_type)
      [exported_event] = Export.export_competition(competition)["events"]
      assert exported_event["qualification"] == qualification
    end
  end

  test "linked rounds fail before changing the competition" do
    competition = insert(:competition, wca_id: "WC2019", name: "Original name")

    wcif =
      put_in(@wcif, ["events", Access.at(0), "rounds", Access.at(0), "linkedRounds"], [
        "333-r1",
        "333-r2"
      ])

    assert {:error,
            "Dual rounds are only supported by the WCA's Integrated Live Results platform"} =
             Import.import_competition(competition, wcif)

    assert Repo.reload!(competition).name == "Original name"
  end

  test "linked-round participation sources fail before changing the competition" do
    competition = insert(:competition, wca_id: "WC2019", name: "Original name")

    wcif =
      put_in(
        @wcif,
        [
          "events",
          Access.at(0),
          "rounds",
          Access.at(0),
          "participationRuleset",
          "participationSource"
        ],
        %{
          "type" => "linkedRounds",
          "roundIds" => ["333-r1", "333-r2"]
        }
      )

    assert {:error,
            "Dual rounds are only supported by the WCA's Integrated Live Results platform"} =
             Import.import_competition(competition, wcif)

    assert Repo.reload!(competition).name == "Original name"
  end

  test "reserved places fail before changing the competition" do
    competition = insert(:competition, wca_id: "WC2019", name: "Original name")

    wcif =
      put_in(
        @wcif,
        [
          "events",
          Access.at(0),
          "rounds",
          Access.at(0),
          "participationRuleset",
          "reservedPlaces"
        ],
        %{
          "nationalities" => ["GB"],
          "count" => 3
        }
      )

    assert {:error, "Reserved places are not supported by WCA Live (333-r1)"} =
             Import.import_competition(competition, wcif)

    assert Repo.reload!(competition).name == "Original name"
  end

  test "registration participation sources are rejected after the first round" do
    competition = insert(:competition, wca_id: "WC2019", name: "Original name")
    wcif = put_in(@wcif, ["events", Access.at(0), "rounds", Access.at(0), "id"], "333-r2")

    assert {:error, "Unsupported participation source or result condition in 333-r2"} =
             Import.import_competition(competition, wcif)

    assert Repo.reload!(competition).name == "Original name"
  end

  test "WCIF v1 is rejected before changing the competition" do
    competition = insert(:competition, wca_id: "WC2019", name: "Original name")
    wcif = %{@wcif | "formatVersion" => "1.0"}

    assert {:error, "expected WCIF version 2"} = Import.import_competition(competition, wcif)
    assert Repo.reload!(competition).name == "Original name"
  end

  test "import_competition/2 imports nested objects into the corresponding associations" do
    # That's not a very detailed test in terms of possible cases,
    # but it briefly checks that all the associations are saved properly.

    # Some existing data.
    competition = insert(:competition, wca_id: "WC2019", name: "Some Name 2020")
    insert(:competition_event, competition: competition, event_id: "333")
    insert(:competition_event, competition: competition, event_id: "444")
    insert_list(5, :person, competition: competition)
    venue = insert(:venue, competition: competition)
    insert(:room, venue: venue)

    assert {:ok, competition} = Import.import_competition(competition, @wcif)

    # People

    people = competition |> Ecto.assoc(:people) |> Repo.all()
    assert 1 == length(people)
    person = hd(people)
    assert "Sherlock Holmes" == person.name
    registration = person |> Ecto.assoc(:registration) |> Repo.one!()
    assert "accepted" == registration.status

    # Competition events

    competition_events = competition |> Ecto.assoc(:competition_events) |> Repo.all()
    assert 1 == length(competition_events)
    competition_event = hd(competition_events)
    assert "333" == competition_event.event_id
    assert ~D[2019-07-01] == competition_event.qualification.when_date

    # Rounds

    rounds = competition_event |> Ecto.assoc(:rounds) |> Repo.all()
    assert 1 == length(rounds)
    round = hd(rounds)
    assert 1 == round.number
    assert 3000 == round.cutoff.attempt_result
    assert 18000 == round.time_limit.centiseconds

    # Venues

    venues = competition |> Ecto.assoc(:venues) |> Repo.all()
    assert 1 == length(venues)
    venue = hd(venues)
    assert "Melbourne Convention and Exhibition Centre" == venue.name
    assert 1 = venue.wcif_id

    # Rooms

    rooms = venue |> Ecto.assoc(:rooms) |> Repo.all()
    assert 1 == length(rooms)
    room = hd(rooms)
    assert "Main stage" == room.name

    # Activities

    activities = room |> Ecto.assoc(:activities) |> Repo.all()
    assert 1 == length(activities)
    activity = hd(activities)
    assert "333-r1" == activity.activity_code
    assert round.id == activity.round_id

    # Assignments

    assignments = person |> Ecto.assoc(:assignments) |> Repo.all()
    assert 1 == length(assignments)
    assignment = hd(assignments)
    assert "competitor" == assignment.assignment_code
    assert activity.id == assignment.activity_id
    assert person.id == assignment.person_id

    # Staff members

    staff_members = competition |> Ecto.assoc(:staff_members) |> Repo.all()
    assert 1 == length(staff_members)
    staff_member = hd(staff_members)
    assert ["delegate"] == staff_member.roles
    user = staff_member |> Ecto.assoc(:user) |> Repo.one!()
    assert person.wca_user_id == user.wca_user_id
  end

  test "import_competition/2 given a past competition does not update personal bests" do
    competition = insert(:competition, wca_id: "WC2019", name: "Some Name 2020")

    person = insert(:person, competition: competition, registrant_id: 1, wca_user_id: 221)

    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)

    assert {:ok, _competition} = Import.import_competition(competition, @wcif)
    personal_bests = person |> Ecto.assoc(:personal_bests) |> Repo.all()
    assert 1 == length(personal_bests)
    single333 = hd(personal_bests)
    assert 800 == single333.best
  end

  test "import_competition/2 given a non past competition updates personal bests" do
    competition = insert(:competition, wca_id: "WC2019", name: "Some Name 2020")
    person = insert(:person, competition: competition, registrant_id: 1, wca_user_id: 221)
    insert(:personal_best, person: person, event_id: "333", type: "single", best: 800)

    # Create new WCIF with future activities start/end time.
    wcif = move_to_today(@wcif)

    assert {:ok, _competition} = Import.import_competition(competition, wcif)
    personal_bests = person |> Ecto.assoc(:personal_bests) |> Repo.all()
    assert 2 == length(personal_bests)

    single333 =
      Enum.find(personal_bests, fn pr -> pr.event_id == "333" and pr.type == "single" end)

    assert 790 == single333.best
  end

  test "import-export integration test" do
    user = insert(:user)

    competition = %Competition{imported_by: user}

    import_wcif = move_to_today(@wcif)

    assert {:ok, competition} = Import.import_competition(competition, import_wcif)
    export_wcif = WcaLive.Synchronization.Export.export_competition(competition)

    # We don't use extensions and they are optional, so we don't store them
    expected_wcif = without_extensions(import_wcif)

    # We currently don't store series information
    expected_wcif = Map.delete(expected_wcif, "series")

    assert export_wcif == expected_wcif
  end

  defp move_to_today(wcif) do
    now = DateTime.utc_now() |> DateTime.truncate(:second)

    wcif
    |> put_in(["schedule", "startDate"], now |> DateTime.to_date() |> Date.to_iso8601())
    |> update_in(
      ["schedule", "venues", Access.all(), "rooms", Access.all(), "activities", Access.all()],
      fn activity ->
        starts = now |> DateTime.add(1 * 3600) |> DateTime.to_iso8601()
        ends = now |> DateTime.add(2 * 3600) |> DateTime.to_iso8601()
        %{activity | "startTime" => starts, "endTime" => ends}
      end
    )
  end

  defp without_extensions(data) when is_map(data) do
    data
    |> Map.delete("extensions")
    |> Map.new(fn {key, value} -> {key, without_extensions(value)} end)
  end

  defp without_extensions(data) when is_list(data) do
    Enum.map(data, &without_extensions/1)
  end

  defp without_extensions(data), do: data
end
