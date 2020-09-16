defmodule WcaLive.Synchronization.ExportTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Synchronization.Export

  @wcif %{
    "formatVersion" => "1.0",
    "id" => "WC2019",
    "name" => "WCA World Championship 2019",
    "shortName" => "WCA WC 2019",
    "competitorLimit" => 1000,
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
            "best" => 790,
            "type" => "single",
            "worldRanking" => 995,
            "continentalRanking" => 105,
            "nationalRanking" => 6
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
              "attemptResult" => 3000
            },
            "advancementCondition" => nil,
            "results" => [],
            "scrambleSetCount" => 4
          }
        ],
        "competitorLimit" => nil,
        "qualification" => nil
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
                  "childActivities" => []
                }
              ]
            }
          ]
        }
      ]
    }
  }

  test "export_competition/1 returns a proper WCIF" do
    competition =
      insert(:competition,
        wca_id: "WC2019",
        name: "WCA World Championship 2019",
        short_name: "WCA WC 2019",
        competitor_limit: 1000,
        start_date: ~D[2019-07-13],
        end_date: ~D[2019-07-14]
      )

    competition_event =
      insert(:competition_event,
        competition: competition,
        event_id: "333",
        competitor_limit: nil,
        qualification: nil
      )

    insert(:round,
      competition_event: competition_event,
      format_id: "a",
      time_limit: build(:time_limit, centiseconds: 18000, cumulative_round_wcif_ids: []),
      cutoff: build(:cutoff, number_of_attempts: 2, attempt_result: 3000),
      advancement_condition: nil,
      scramble_set_count: 4
    )

    venue =
      insert(:venue,
        competition: competition,
        wcif_id: 1,
        name: "Melbourne Convention and Exhibition Centre",
        latitude_microdegrees: -37_825_214,
        longitude_microdegrees: 144_952_280,
        country_iso2: "AU",
        timezone: "Australia/Melbourne"
      )

    room = insert(:room, venue: venue, wcif_id: 1, name: "Main stage", color: "#00aeff")

    activity =
      insert(:activity,
        room: room,
        wcif_id: 1,
        name: "3x3x3 Cube, Round 1",
        activity_code: "333-r1",
        start_time: ~U[2019-07-13 05:20:00Z],
        end_time: ~U[2019-07-13 08:00:00Z]
      )

    person =
      insert(:person,
        competition: competition,
        registrant_id: 1,
        name: "Sherlock Holmes",
        wca_user_id: 221,
        wca_id: "2015HOLM01",
        country_iso2: "GB",
        gender: "m",
        birthdate: ~D[1854-06-20],
        email: "sholmes@gmail.com",
        avatar_url: "https://path.to/avatar",
        avatar_thumb_url: "https://path.to/avatar/thumbnail",
        roles: ["delegate"]
      )

    insert(:registration,
      person: person,
      wca_registration_id: 1,
      status: "accepted",
      guests: 2,
      comments: "I would like to opt-in for the pizza.",
      competition_events: [competition_event]
    )

    insert(:personal_best,
      person: person,
      event_id: "333",
      type: "single",
      best: 790,
      world_ranking: 995,
      continental_ranking: 105,
      national_ranking: 6
    )

    insert(:assignment,
      person: person,
      activity: activity,
      assignment_code: "competitor",
      station_number: nil
    )

    assert @wcif == Export.export_competition(competition)
  end
end
