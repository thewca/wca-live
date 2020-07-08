defmodule WcaLive.Wcif.Import do
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
    Room,
    Round,
    Venue
  }

  def import_competition(competition, wcif) do
    Multi.new()
    |> Multi.insert_or_update(:competition, competition_changeset(competition, wcif))
    |> Multi.update(:with_events, fn %{competition: competition} ->
      competition_events_changeset(competition, wcif)
    end)
    |> Multi.update(:with_schedule, fn %{with_events: competition} ->
      competition_schedule_changeset(competition, wcif)
    end)
    |> Multi.update(:with_people, fn %{with_schedule: competition} ->
      competition_people_changeset(competition, wcif)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{with_people: competition}} -> {:ok, competition}
      {:error, _, _, _} -> {:error, "import failed"}
    end
  end

  defp competition_events_changeset(competition, wcif) do
    competition
    |> Repo.preload(competition_events: [:rounds])
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
    competition
    |> Repo.preload(
      competition_events: [:rounds],
      venues: [rooms: [activities: [:round, [activities: [:round, [activities: [:round]]]]]]]
    )
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
    competition
    |> Repo.preload(
      venues: [rooms: [activities: [:activities]]],
      people: [:registration, :personal_bests, [assignments: [:activity]]]
    )
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
      end_time: Wcif.Utils.last_activity_end_time(wcif),
      synchronized_at: DateTime.utc_now() |> DateTime.truncate(:second)
    })
  end

  defp competition_event_changeset(competition_event, wcif_event, competition) do
    competition_event
    |> CompetitionEvent.changeset(%{
      event_id: wcif_event["id"],
      competitor_limit: wcif_event["competitorLimit"],
      qualification: wcif_event["qualification"] |> wcif_qualification_to_attrs()
    })
    |> cast_embed(:qualification)
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
    |> cast_embed(:time_limit)
    |> cast_embed(:cutoff)
    |> cast_embed(:advancement_condition)
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
    # TODO: add/remove person from first rounds when registration events change.

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
      roles: wcif_person["roles"],
      registration: wcif_person["registration"] |> wcif_registration_to_attrs()
    })
    |> cast_assoc(:registration)
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
  end

  defp wcif_registration_to_attrs(nil), do: nil

  defp wcif_registration_to_attrs(wcif_registration) do
    %{
      wca_registration_id: wcif_registration["wcaRegistrationId"],
      status: wcif_registration["status"],
      event_ids: wcif_registration["eventIds"],
      guests: wcif_registration["guests"],
      comments: wcif_registration["comments"]
    }
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

  defp build_assoc_changesets(changeset, name, params_list, build_changeset, compare) do
    built? = Ecto.get_meta(changeset.data, :state) == :built
    structs = if built?, do: [], else: Map.get(changeset.data, name)
    default = Ecto.build_assoc(changeset.data, name)

    assoc =
      Enum.map(params_list, fn params ->
        Enum.find(structs, default, &compare.(&1, params))
        |> build_changeset.(params)
      end)

    put_assoc(changeset, name, assoc)
  end
end
