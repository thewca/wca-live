defmodule WcaLive.Synchronization.Import do
  alias WcaLive.Repo
  alias Ecto.Multi
  import Ecto.Changeset

  alias WcaLive.Wcif

  alias WcaLive.Competitions.{
    Activity,
    Assignment,
    Competition,
    CompetitionEvent,
    Person,
    PersonalBest,
    Registration,
    Room,
    Venue
  }

  alias WcaLive.Scoretaking.{Round, Result}

  def import_competition(competition, wcif) do
    Multi.new()
    |> Multi.insert_or_update(:competition, competition_changeset(competition, wcif))
    |> Multi.update(:update_events, fn %{competition: competition} ->
      competition_events_changeset(competition, wcif)
    end)
    |> Multi.update(:update_schedule, fn %{update_events: competition} ->
      competition_schedule_changeset(competition, wcif)
    end)
    |> Multi.update(:update_people, fn %{update_schedule: competition} ->
      competition_people_changeset(competition, wcif)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{update_people: competition}} -> {:ok, competition}
      {:error, _, reason, _} -> {:error, reason}
    end
  end

  # Note: the top-level functions preload associations for efficiency reasons,
  # but the specific changeset functions still make calls to `Repo.preload/1`.
  # That's because those functions may receive a newly build struct
  # with associations being NotLoaded, in which case calling `preload`
  # sets an empty list as expected. The key fact is that `preload`
  # doesn't trigger any queries if the data is already preloaded
  # and that's why we preload everything in the top-level functions.

  defp competition_events_changeset(competition, wcif) do
    competition =
      competition
      |> Repo.preload(competition_events: [:rounds])

    competition
    |> change()
    |> build_assoc_changesets(
      :competition_events,
      wcif["events"],
      &competition_event_changeset(&1, &2, competition),
      fn competition_event, wcif_event ->
        competition_event.event_id == wcif_event["id"]
      end
    )
  end

  defp competition_schedule_changeset(competition, wcif) do
    competition =
      competition
      |> Repo.preload(
        competition_events: [:rounds],
        venues: [rooms: [activities: [:round, activities: [:round, activities: [:round]]]]]
      )

    competition
    |> change()
    |> build_assoc_changesets(
      :venues,
      wcif["schedule"]["venues"],
      &venue_changeset(&1, &2, competition),
      fn venue, wcif_venue ->
        venue.wcif_id == wcif_venue["id"]
      end
    )
  end

  defp competition_people_changeset(competition, wcif) do
    competition =
      competition
      |> Repo.preload(
        competition_events: [rounds: [:results]],
        venues: [rooms: [activities: [:activities]]],
        people: [
          :results,
          :personal_bests,
          registration: [:competition_events],
          assignments: [:activity]
        ]
      )

    competition
    |> change()
    |> build_assoc_changesets(
      :people,
      wcif["persons"],
      &person_changeset(&1, &2, competition),
      fn person, wcif_person ->
        person.wca_user_id == wcif_person["wcaUserId"]
      end
    )
  end

  defp competition_changeset(competition, wcif) do
    competition
    |> Competition.changeset(%{
      wca_id: wcif["id"],
      name: wcif["name"],
      short_name: wcif["shortName"],
      competitor_limit: wcif["competitorLimit"],
      start_date: Wcif.Utils.start_date(wcif),
      end_date: Wcif.Utils.end_date(wcif),
      start_time: Wcif.Utils.first_activity_start_time(wcif),
      end_time: Wcif.Utils.last_activity_end_time(wcif)
    })
    |> put_change(:synchronized_at, DateTime.utc_now() |> DateTime.truncate(:second))
  end

  defp competition_event_changeset(competition_event, wcif_event, competition) do
    competition_event = competition_event |> Repo.preload(:rounds)

    competition_event
    |> CompetitionEvent.changeset(%{
      event_id: wcif_event["id"],
      competitor_limit: wcif_event["competitorLimit"],
      qualification: wcif_event["qualification"] |> wcif_qualification_to_attrs()
    })
    |> build_assoc_changesets(
      :rounds,
      wcif_event["rounds"],
      &round_changeset(&1, &2, competition),
      fn round, wcif_round ->
        %{event_id: event_id, round_number: number} = Wcif.ActivityCode.parse!(wcif_round["id"])
        competition_event.event_id == event_id and round.number == number
      end
    )
  end

  defp wcif_qualification_to_attrs(nil), do: nil

  defp wcif_qualification_to_attrs(wcif_qualification) do
    %{
      attempt_result: wcif_qualification["attemptResult"],
      type: wcif_qualification["type"],
      when: wcif_qualification["when"]
    }
  end

  defp round_changeset(round, wcif_round, _competition) do
    round
    |> Round.changeset(%{
      number: wcif_round["id"] |> Wcif.ActivityCode.parse!() |> Map.fetch!(:round_number),
      format_id: wcif_round["format"],
      time_limit: wcif_round["timeLimit"] |> wcif_time_limit_to_attrs(),
      cutoff: wcif_round["cutoff"] |> wcif_cutoff_to_attrs(),
      advancement_condition:
        wcif_round["advancementCondition"] |> wcif_advancement_condition_to_attrs(),
      scramble_set_count: wcif_round["scrambleSetCount"]
    })
  end

  defp wcif_time_limit_to_attrs(nil), do: nil

  defp wcif_time_limit_to_attrs(wcif_time_limit) do
    %{
      centiseconds: wcif_time_limit["centiseconds"],
      cumulative_round_wcif_ids: wcif_time_limit["cumulativeRoundIds"]
    }
  end

  defp wcif_cutoff_to_attrs(nil), do: nil

  defp wcif_cutoff_to_attrs(wcif_cutoff) do
    %{
      attempt_result: wcif_cutoff["attemptResult"],
      number_of_attempts: wcif_cutoff["numberOfAttempts"]
    }
  end

  defp wcif_advancement_condition_to_attrs(nil), do: nil

  defp wcif_advancement_condition_to_attrs(wcif_advancement_condition) do
    %{
      level: wcif_advancement_condition["level"],
      type: wcif_advancement_condition["type"]
    }
  end

  defp venue_changeset(venue, wcif_venue, competition) do
    venue = venue |> Repo.preload(:rooms)

    venue
    |> Venue.changeset(%{
      wcif_id: wcif_venue["id"],
      name: wcif_venue["name"],
      latitude_microdegrees: wcif_venue["latitudeMicrodegrees"],
      longitude_microdegrees: wcif_venue["longitudeMicrodegrees"],
      country_iso2: wcif_venue["countryIso2"],
      timezone: wcif_venue["timezone"]
    })
    |> build_assoc_changesets(
      :rooms,
      wcif_venue["rooms"],
      &room_changeset(&1, &2, competition),
      fn room, wcif_room ->
        room.wcif_id == wcif_room["id"]
      end
    )
  end

  defp room_changeset(room, wcif_room, competition) do
    room = room |> Repo.preload(:activities)

    room
    |> Room.changeset(%{
      wcif_id: wcif_room["id"],
      name: wcif_room["name"],
      color: wcif_room["color"]
    })
    |> build_assoc_changesets(
      :activities,
      wcif_room["activities"],
      &activity_changeset(&1, &2, competition),
      fn activity, wcif_activity ->
        activity.wcif_id == wcif_activity["id"]
      end
    )
  end

  defp activity_changeset(activity, wcif_activity, competition) do
    activity = activity |> Repo.preload(:activities)

    round = Competition.find_round_by_activity_code(competition, wcif_activity["activityCode"])

    activity
    |> Activity.changeset(%{
      wcif_id: wcif_activity["id"],
      name: wcif_activity["name"],
      activity_code: wcif_activity["activityCode"],
      start_time: wcif_activity["startTime"],
      end_time: wcif_activity["endTime"]
    })
    |> build_assoc_changesets(
      :activities,
      wcif_activity["childActivities"],
      &activity_changeset(&1, &2, competition),
      fn activity, wcif_activity ->
        activity.wcif_id == wcif_activity["id"]
      end
    )
    |> put_assoc(:round, round)
  end

  defp person_changeset(person, wcif_person, competition) do
    person = person |> Repo.preload([:results, :registration, :personal_bests, :assignments])

    person
    |> Person.changeset(%{
      registrant_id: wcif_person["registrantId"],
      name: wcif_person["name"],
      wca_user_id: wcif_person["wcaUserId"],
      wca_id: wcif_person["wcaId"],
      country_iso2: wcif_person["countryIso2"],
      gender: wcif_person["gender"],
      birthdate: wcif_person["birthdate"],
      email: wcif_person["email"],
      avatar_url: wcif_person["avatar"]["url"],
      avatar_thumb_url: wcif_person["avatar"]["thumbUrl"],
      roles: wcif_person["roles"]
    })
    |> build_assoc_changeset(
      :registration,
      wcif_person["registration"],
      &registration_changeset(&1, &2, competition)
    )
    |> build_assoc_changesets(
      :personal_bests,
      wcif_person["personalBests"],
      &personal_best_changeset(&1, &2, competition),
      fn personal_best, wcif_personal_best ->
        personal_best.event_id == wcif_personal_best["eventId"] and
          personal_best.type == wcif_personal_best["type"]
      end
    )
    |> build_assoc_changesets(
      :assignments,
      wcif_person["assignments"],
      &assignment_changeset(&1, &2, competition),
      fn assignment, wcif_assignment ->
        assignment.activity.wcif_id == wcif_assignment["activityId"] and
          assignment.assignment_code == wcif_assignment["assignmentCode"]
      end
    )
    |> put_assoc(:results, person_results(person, wcif_person, competition))
  end

  defp registration_changeset(_registration, nil = _wcif_registration, _competition), do: nil

  defp registration_changeset(registration, wcif_registration, competition) do
    registration = registration |> Repo.preload(:competition_events)

    competition_events =
      Enum.filter(competition.competition_events, &(&1.event_id in wcif_registration["eventIds"]))

    registration
    |> Registration.changeset(%{
      wca_registration_id: wcif_registration["wcaRegistrationId"],
      status: wcif_registration["status"],
      guests: wcif_registration["guests"],
      comments: wcif_registration["comments"]
    })
    |> put_assoc(:competition_events, competition_events)
  end

  defp personal_best_changeset(personal_best, wcif_personal_best, _competition) do
    personal_best
    |> PersonalBest.changeset(%{
      event_id: wcif_personal_best["eventId"],
      type: wcif_personal_best["type"],
      best: wcif_personal_best["best"],
      world_ranking: wcif_personal_best["worldRanking"],
      continental_ranking: wcif_personal_best["continentalRanking"],
      national_ranking: wcif_personal_best["nationalRanking"]
    })
  end

  defp assignment_changeset(assignment, wcif_assignment, competition) do
    activity = Competition.find_activity_by_wcif_id!(competition, wcif_assignment["activityId"])

    assignment
    |> Assignment.changeset(%{
      assignment_code: wcif_assignment["assignmentCode"],
      station_number: wcif_assignment["stationNumber"]
    })
    |> put_assoc(:activity, activity)
  end

  # Checks for new registration events and adds builds empty results,
  # if the corresponding first round is already open, but not finished.
  defp person_results(person, wcif_person, competition) do
    current_event_ids = accepted_person_event_ids(person)
    updated_event_ids = accepted_wcif_person_event_ids(wcif_person)

    new_event_ids = updated_event_ids -- current_event_ids

    new_results =
      competition.competition_events
      |> Enum.filter(&(&1.event_id in new_event_ids))
      |> Enum.map(fn competition_event ->
        Enum.find(competition_event.rounds, &(&1.number == 1))
      end)
      |> Enum.filter(fn round -> Round.open?(round) and not Round.finished?(round) end)
      |> Enum.filter(fn round ->
        not Enum.any?(person.results, fn result -> result.round_id == round.id end)
      end)
      |> Enum.map(&Result.empty_result(round: &1))

    new_results ++ person.results
  end

  defp accepted_person_event_ids(%Person{registration: %{status: "accepted"}} = person) do
    Enum.map(person.registration.competition_events, & &1.event_id)
  end

  defp accepted_person_event_ids(%Person{}), do: []

  defp accepted_wcif_person_event_ids(
         %{"registration" => %{"status" => "accepted"}} = wcif_person
       ) do
    wcif_person["registration"]["eventIds"]
  end

  defp accepted_wcif_person_event_ids(_wcif_person), do: []

  # Utils

  defp build_assoc_changesets(changeset, name, params_list, build_changeset, equality) do
    structs = Map.get(changeset.data, name)
    default = Ecto.build_assoc(changeset.data, name)

    assoc =
      Enum.map(params_list, fn params ->
        Enum.find(structs, default, &equality.(&1, params))
        |> build_changeset.(params)
      end)

    put_assoc(changeset, name, assoc)
  end

  defp build_assoc_changeset(changeset, name, params, build_changeset) do
    default = Ecto.build_assoc(changeset.data, name)
    struct = Map.get(changeset.data, name) || default

    assoc = build_changeset.(struct, params)

    put_assoc(changeset, name, assoc)
  end
end
