defmodule WcaLive.Synchronization.Export do
  alias WcaLive.Repo
  alias WcaLive.Wcif
  alias WcaLive.Competitions.Competition

  @doc """
  Returns WCIF representation of the given competition.
  """
  @spec export_competition(%Competition{}) :: map()
  def export_competition(competition) do
    competition
    |> preload_all()
    |> competition_to_wcif()
  end

  # Preloads all the associations necessary for building the whole WCIF.
  defp preload_all(competition) do
    competition
    |> Repo.preload(
      competition_events: [rounds: [:competition_event, results: [:person]]],
      venues: [
        rooms: [activities: [:round, [child_activities: [:round, [child_activities: [:round]]]]]]
      ],
      people: [:personal_bests, registration: :competition_events, assignments: [:activity]]
    )
  end

  defp competition_to_wcif(competition) do
    %{
      "formatVersion" => "1.0",
      "id" => competition.wca_id,
      "name" => competition.name,
      "shortName" => competition.short_name,
      "persons" => competition.people |> Enum.map(&person_to_wcif/1),
      "events" => competition.competition_events |> Enum.map(&competition_event_to_wcif/1),
      "schedule" => %{
        "startDate" => competition.start_date |> Date.to_iso8601(),
        "numberOfDays" => Date.diff(competition.end_date, competition.start_date) + 1,
        "venues" => competition.venues |> Enum.map(&venue_to_wcif/1)
      },
      "competitorLimit" => competition.competitor_limit
    }
  end

  defp person_to_wcif(person) do
    %{
      "registrantId" => person.registrant_id,
      "name" => person.name,
      "wcaUserId" => person.wca_user_id,
      "wcaId" => person.wca_id,
      "countryIso2" => person.country_iso2,
      "gender" => person.gender,
      "birthdate" => person.birthdate |> Date.to_iso8601(),
      "email" => person.email,
      "avatar" =>
        person.avatar_url && person.avatar_thumb_url &&
          %{
            "url" => person.avatar_url,
            "thumbUrl" => person.avatar_thumb_url
          },
      "roles" => person.roles,
      "registration" => person.registration && person.registration |> registration_to_wcif(),
      "assignments" => person.assignments |> Enum.map(&assignment_to_wcif/1),
      "personalBests" => person.personal_bests |> Enum.map(&personal_best_to_wcif/1)
    }
  end

  defp registration_to_wcif(registration) do
    %{
      "wcaRegistrationId" => registration.wca_registration_id,
      "eventIds" => registration.competition_events |> Enum.map(& &1.event_id),
      "status" => registration.status,
      "guests" => registration.guests,
      "comments" => registration.comments
    }
  end

  defp assignment_to_wcif(assignment) do
    %{
      "activityId" => assignment.activity.wcif_id,
      "assignmentCode" => assignment.assignment_code,
      "stationNumber" => assignment.station_number
    }
  end

  defp personal_best_to_wcif(personal_best) do
    %{
      "eventId" => personal_best.event_id,
      "type" => personal_best.type,
      "best" => personal_best.best,
      "worldRanking" => personal_best.world_ranking,
      "continentalRanking" => personal_best.continental_ranking,
      "nationalRanking" => personal_best.national_ranking
    }
  end

  defp competition_event_to_wcif(competition_event) do
    %{
      "id" => competition_event.event_id,
      "competitorLimit" => competition_event.competitor_limit,
      "qualification" =>
        competition_event.qualification &&
          competition_event.qualification |> qualification_to_wcif(),
      "rounds" =>
        competition_event.rounds |> Enum.sort_by(& &1.number) |> Enum.map(&round_to_wcif/1)
    }
  end

  defp qualification_to_wcif(qualification) do
    %{
      "type" => qualification.type,
      "resultType" => qualification.result_type,
      "level" => qualification.level,
      "whenDate" => qualification.when_date |> Date.to_iso8601()
    }
  end

  defp round_to_wcif(round) do
    %{
      "id" => round_wcif_id(round),
      "format" => round.format_id,
      "timeLimit" => round.time_limit && round.time_limit |> time_limit_to_wcif(),
      "cutoff" => round.cutoff && round.cutoff |> cutoff_to_wcif(),
      "advancementCondition" =>
        round.advancement_condition &&
          round.advancement_condition |> advancement_condition_to_wcif(),
      "results" => round.results |> Enum.map(&result_to_wcif/1),
      "scrambleSetCount" => round.scramble_set_count
      # "scrambleSets" => [] # ignored for now
    }
  end

  defp round_wcif_id(round) do
    %Wcif.ActivityCode.Official{
      event_id: round.competition_event.event_id,
      round_number: round.number
    }
    |> to_string()
  end

  defp time_limit_to_wcif(time_limit) do
    %{
      "centiseconds" => time_limit.centiseconds,
      "cumulativeRoundIds" => time_limit.cumulative_round_wcif_ids
    }
  end

  defp cutoff_to_wcif(cutoff) do
    %{
      "attemptResult" => cutoff.attempt_result,
      "numberOfAttempts" => cutoff.number_of_attempts
    }
  end

  defp advancement_condition_to_wcif(advancement_condition) do
    %{
      "type" => advancement_condition.type,
      "level" => advancement_condition.level
    }
  end

  defp result_to_wcif(result) do
    %{
      "personId" => result.person.registrant_id,
      "ranking" => result.ranking,
      "attempts" => result.attempts |> Enum.map(&attempt_to_wcif/1),
      "best" => result.best,
      "average" => result.average
    }
  end

  defp attempt_to_wcif(attempt) do
    %{
      "result" => attempt.result,
      "reconstruction" => attempt.reconstruction
    }
  end

  defp venue_to_wcif(venue) do
    %{
      "id" => venue.wcif_id,
      "name" => venue.name,
      "latitudeMicrodegrees" => venue.latitude_microdegrees,
      "longitudeMicrodegrees" => venue.longitude_microdegrees,
      "countryIso2" => venue.country_iso2,
      "timezone" => venue.timezone,
      "rooms" => venue.rooms |> Enum.map(&room_to_wcif/1)
    }
  end

  defp room_to_wcif(room) do
    %{
      "id" => room.wcif_id,
      "name" => room.name,
      "color" => room.color,
      "activities" => room.activities |> Enum.map(&activity_to_wcif/1)
    }
  end

  defp activity_to_wcif(activity) do
    %{
      "id" => activity.wcif_id,
      "name" => activity.name,
      "activityCode" => activity.activity_code,
      "startTime" => activity.start_time |> DateTime.to_iso8601(),
      "endTime" => activity.end_time |> DateTime.to_iso8601(),
      "childActivities" => activity.child_activities |> Enum.map(&activity_to_wcif/1)
      # "scrambleSetId" => nil # ignored for now
    }
  end
end
