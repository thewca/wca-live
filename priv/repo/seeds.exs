# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     WcaLive.Repo.insert!(%WcaLive.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

Code.require_file("test/support/factory.ex")
Application.ensure_all_started(:ex_machina)

alias WcaLive.Factory

start_time = DateTime.utc_now() |> DateTime.add(90, :day)
start_date = DateTime.to_date(start_time)

competition =
  Factory.insert(:competition,
    wca_id: "Example#{start_date.year}",
    name: "Example #{start_date.year}",
    short_name: "Example #{start_date.year}",
    start_date: start_date,
    end_date: start_date,
    start_time: start_time,
    end_time: DateTime.add(start_time, 3, :hour)
  )

ce333 = Factory.insert(:competition_event, competition: competition, event_id: "333")
ce222 = Factory.insert(:competition_event, competition: competition, event_id: "222")

ce333_r1 =
  Factory.insert(:round,
    number: 1,
    competition_event: ce333,
    format_id: "a",
    time_limit: Factory.build(:time_limit, centiseconds: 4000),
    cutoff: Factory.build(:cutoff, number_of_attempts: 2, attempt_result: 3000),
    advancement_condition: Factory.build(:advancement_condition, type: "ranking", level: 10)
  )

ce333_r2 =
  Factory.insert(:round,
    number: 2,
    competition_event: ce333,
    format_id: "a",
    time_limit: Factory.build(:time_limit),
    cutoff: nil,
    advancement_condition: nil
  )

ce222_r1 =
  Factory.insert(:round,
    number: 1,
    competition_event: ce222,
    format_id: "a",
    time_limit: Factory.build(:time_limit, centiseconds: 4000),
    cutoff: Factory.build(:cutoff, number_of_attempts: 2, attempt_result: 3000),
    advancement_condition: nil
  )

venue = Factory.insert(:venue, competition: competition)
room = Factory.insert(:room, venue: venue)

room = Factory.insert(:room, venue: venue)

Factory.insert(:activity,
  room: room,
  wcif_id: 1,
  name: "3x3x3 Cube, Round 1",
  activity_code: "333-r1",
  start_time: start_time,
  end_time: DateTime.add(start_time, 1, :hour),
  round: ce333_r1
)

Factory.insert(:activity,
  room: room,
  wcif_id: 2,
  name: "3x3x3 Cube, Round 2",
  activity_code: "333-r2",
  start_time: DateTime.add(start_time, 1, :hour),
  end_time: DateTime.add(start_time, 2, :hour),
  round: ce333_r2
)

Factory.insert(:activity,
  room: room,
  wcif_id: 3,
  name: "2x2x2 Cube, Round 1",
  activity_code: "222-r1",
  start_time: DateTime.add(start_time, 2, :hour),
  end_time: DateTime.add(start_time, 3, :hour),
  round: ce222_r1
)

for n <- 1..200 do
  person =
    Factory.insert(:person,
      competition: competition,
      registrant_id: n,
      name: "Competitor #{n}"
    )

  Factory.insert(:registration,
    person: person,
    status: "accepted",
    competition_events: [ce333, ce222]
  )

  for event_id <- ["222", "333"] do
    Factory.insert(:personal_best,
      person: person,
      event_id: event_id,
      type: "single",
      best: 800 + n,
      world_ranking: 1000 + n,
      continental_ranking: 100 + n,
      national_ranking: 10 + n
    )

    Factory.insert(:personal_best,
      person: person,
      event_id: event_id,
      type: "average",
      best: 1000 + n,
      world_ranking: 1000 + n,
      continental_ranking: 100 + n,
      national_ranking: 10 + n
    )
  end

  for round <- [ce333_r1, ce222_r1] do
    Factory.insert(:result,
      person: person,
      round: round,
      ranking: n,
      advancing: n <= 10,
      advancing_questionable: false,
      best: 1000 + n,
      average: 1600 + n,
      attempts: [
        Factory.build(:attempt, result: 1000 + n),
        Factory.build(:attempt, result: 1800 + n),
        Factory.build(:attempt, result: 1600 + n),
        Factory.build(:attempt, result: 1400 + n),
        Factory.build(:attempt, result: 2000 + n)
      ],
      average_record_tag: nil,
      single_record_tag: nil
    )
  end
end
