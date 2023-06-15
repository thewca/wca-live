defmodule WcaLive.Synchronization.Import do
  import Ecto.Query, warn: false
  import Ecto.Changeset

  alias WcaLive.Repo
  alias Ecto.Multi
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
    StaffMember,
    Venue
  }

  alias WcaLive.Scoretaking.{Round, Result}
  alias WcaLive.Accounts.User

  # When importing a competition, all inserts happen within a single
  # transaction and for largest competitions it may hit the default
  # transaction timeout of 15s
  @import_transaction_timeout 60_000

  @doc """
  Either inserts or updates the given competition and all the relevant
  associations based on the given WCIF.
  """
  @spec import_competition(%Competition{} | Changeset.t(), map()) ::
          {:ok, %Competition{}} | {:error, any()}
  def import_competition(competition, wcif) do
    Multi.new()
    |> Multi.insert_or_update(:competition, competition_changeset(competition, wcif))
    |> Multi.merge(fn _changes ->
      new_users_multi(wcif)
    end)
    |> Multi.update(:update_staff_members, fn %{competition: competition} ->
      competition_staff_members_changeset(competition, wcif)
    end)
    |> Multi.update(:update_events, fn %{competition: competition} ->
      competition_events_changeset(competition, wcif)
    end)
    |> Multi.update(:update_schedule, fn %{update_events: competition} ->
      competition_schedule_changeset(competition, wcif)
    end)
    |> Multi.update(:update_people, fn %{update_schedule: competition} ->
      competition_people_changeset(competition, wcif)
    end)
    |> Repo.transaction(timeout: @import_transaction_timeout)
    |> case do
      {:ok, %{update_people: competition}} -> {:ok, competition}
      {:error, _, reason, _} -> {:error, reason}
    end
  end

  defp new_users_multi(wcif) do
    wcif_wuids = Enum.map(wcif["persons"], & &1["wcaUserId"])

    existing_wuids =
      Repo.all(from u in User, where: u.wca_user_id in ^wcif_wuids, select: u.wca_user_id)

    new_wuids = wcif_wuids -- existing_wuids

    wcif["persons"]
    |> Enum.filter(fn person -> person["wcaUserId"] in new_wuids end)
    |> Enum.map(&wcif_person_to_user_changeset/1)
    |> Enum.with_index()
    |> Enum.reduce(Multi.new(), fn {user_changeset, index}, multi ->
      Multi.insert(multi, {:user, index}, user_changeset)
    end)
  end

  # Creates a new user changeset based on WCIF Person.
  # The user has all the necessary information except for access token,
  # which is created when the physical user signs in using OAuth.
  defp wcif_person_to_user_changeset(wcif_person) do
    User.changeset(%User{}, %{
      email: wcif_person["email"],
      wca_user_id: wcif_person["wcaUserId"],
      name: wcif_person["name"],
      wca_id: wcif_person["wcaId"],
      country_iso2: wcif_person["countryIso2"],
      avatar_url: wcif_person["avatar"]["url"],
      avatar_thumb_url: wcif_person["avatar"]["thumbUrl"]
    })
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

  # Builds a changeset with updated competition staff members.
  #
  # WCIF carries some information about roles, but only for people in the WCIF (mostly competitors),
  # whereas we want to allow adding any *user* as a staff member (e.g. a non-competing scoretaker).
  # For this reason we define the StaffMember schema linking competition with relevant users
  # that have some roles important from the app's point of view. It's an internal way of access management.
  # Even though we have that separate schema, we want to do take WCIF role changes into consideration
  # and also save any local StaffMember role changes back to the WCA website (whenever possible).
  # This is a bit tricky, because roles may change both within the app and in the WCIF (by another tool),
  # and we need to cleverly merge those changes.
  #
  # There are three sources of truth (roles):
  #
  # - WCIF Person#roles - roles in the new WCIF
  # - Database Person#roles - roles in the old WCIF (from the last synchronization)
  # - Database StaffMember#roles - roles managed by the application (storing a defined subset of roles)
  #
  # As the second source represents person roles from last synchronization, those may be considered
  # as a base point from which WCIF roles and StaffMember roles diverged (like two branches).
  # The synchronization algorithm takes roles common to all the sources
  # and then adds roles added by either of those two "branches" (i.e. WCIF and local StaffMember).
  # This approach also effectively removes the roles that were removed by either "branch".
  #
  # In the first step we use this approach to determine the new group of staff members
  # and then for each of them we use the same approach to determine roles of the given staff member.
  defp competition_staff_members_changeset(competition, wcif) do
    competition = Repo.preload(competition, [:people, staff_members: :user])

    wcif_staff_members = Enum.filter(wcif["persons"], &any_staff_role?(&1["roles"]))

    # To avoid longish names: `_wids` <=> `_wca_user_ids`.

    new_wcif_staff_wuids =
      wcif_staff_members
      |> Enum.map(& &1["wcaUserId"])
      |> MapSet.new()

    old_wcif_staff_wuids =
      competition.people
      |> Enum.filter(&any_staff_role?(&1.roles))
      |> Enum.map(& &1.wca_user_id)
      |> MapSet.new()

    staff_member_wuids =
      competition.staff_members
      |> Enum.map(& &1.user.wca_user_id)
      |> MapSet.new()

    added_staff_wuids =
      MapSet.union(
        MapSet.difference(staff_member_wuids, old_wcif_staff_wuids),
        MapSet.difference(new_wcif_staff_wuids, old_wcif_staff_wuids)
      )

    unchanged_staff_wuids =
      staff_member_wuids
      |> MapSet.intersection(old_wcif_staff_wuids)
      |> MapSet.intersection(new_wcif_staff_wuids)

    final_staff_wuids = MapSet.union(unchanged_staff_wuids, added_staff_wuids) |> MapSet.to_list()

    users = Repo.all(from u in User, where: u.wca_user_id in ^final_staff_wuids)

    staff_members =
      Enum.map(final_staff_wuids, fn staff_wca_user_id ->
        wcif_person = Enum.find(wcif["persons"], &(&1["wcaUserId"] == staff_wca_user_id))

        person = Enum.find(competition.people, &(&1.wca_user_id == staff_wca_user_id))

        staff_member =
          Enum.find(
            competition.staff_members,
            %StaffMember{},
            &(&1.user.wca_user_id == staff_wca_user_id)
          )

        user = Enum.find(users, &(&1.wca_user_id == staff_wca_user_id))

        new_wcif_roles =
          if(wcif_person, do: wcif_person["roles"], else: []) |> staff_roles() |> MapSet.new()

        old_new_wcif_roles =
          if(person, do: person.roles, else: []) |> staff_roles() |> MapSet.new()

        staff_member_roles = staff_member.roles |> staff_roles() |> MapSet.new()

        added_roles =
          MapSet.union(
            MapSet.difference(staff_member_roles, old_new_wcif_roles),
            MapSet.difference(new_wcif_roles, old_new_wcif_roles)
          )

        unchanged_roles =
          staff_member_roles
          |> MapSet.intersection(old_new_wcif_roles)
          |> MapSet.intersection(new_wcif_roles)

        roles = MapSet.union(unchanged_roles, added_roles) |> MapSet.to_list()

        staff_member
        |> StaffMember.changeset(%{roles: roles})
        |> put_assoc(:user, user)
      end)

    competition
    |> change()
    |> put_assoc(:staff_members, staff_members)
  end

  defp any_staff_role?(roles) do
    Enum.any?(roles, &StaffMember.valid_staff_role?/1)
  end

  defp staff_roles(new_wcif_roles) do
    Enum.filter(new_wcif_roles, &StaffMember.valid_staff_role?/1)
  end

  # Note: the top-level functions preload associations for efficiency reasons,
  # but the specific changeset functions still make calls to `Repo.preload/1`.
  # That's because those functions may receive a newly built struct
  # with associations being NotLoaded, in which case calling `preload`
  # sets an empty list as expected. The key fact is that `preload`
  # doesn't trigger any queries if the data is already preloaded
  # and that's why we preload everything in the top-level functions.

  defp competition_events_changeset(competition, wcif) do
    competition = Repo.preload(competition, competition_events: [:rounds])

    competition
    |> change()
    |> build_assoc(:competition_events, wcif["events"],
      with: &competition_event_changeset(&1, &2, competition),
      equality: fn competition_event, wcif_event ->
        competition_event.event_id == wcif_event["id"]
      end
    )
  end

  defp competition_schedule_changeset(competition, wcif) do
    competition =
      Repo.preload(competition,
        competition_events: [:rounds],
        venues: [
          rooms: [activities: [:round, child_activities: [:round, child_activities: [:round]]]]
        ]
      )

    competition
    |> change()
    |> build_assoc(:venues, wcif["schedule"]["venues"],
      with: &venue_changeset(&1, &2, competition),
      equality: fn venue, wcif_venue -> venue.wcif_id == wcif_venue["id"] end
    )
  end

  defp competition_people_changeset(competition, wcif) do
    competition =
      Repo.preload(competition,
        competition_events: [rounds: [:results]],
        venues: [rooms: [activities: [child_activities: [:child_activities]]]],
        people: [
          :results,
          :personal_bests,
          registration: [:competition_events],
          assignments: [:activity]
        ],
        staff_members: [:user]
      )

    competition
    |> change()
    |> build_assoc(:people, wcif["persons"],
      with: &person_changeset(&1, &2, competition),
      equality: fn person, wcif_person ->
        person.wca_user_id == wcif_person["wcaUserId"]
      end
    )
  end

  defp competition_event_changeset(competition_event, wcif_event, competition) do
    competition_event = Repo.preload(competition_event, :rounds)

    competition_event
    |> CompetitionEvent.changeset(%{
      event_id: wcif_event["id"],
      competitor_limit: wcif_event["competitorLimit"],
      qualification: wcif_event["qualification"] |> wcif_qualification_to_attrs()
    })
    |> build_assoc(:rounds, wcif_event["rounds"],
      with: &round_changeset(&1, &2, competition),
      equality: fn round, wcif_round ->
        %{event_id: event_id, round_number: number} = Wcif.ActivityCode.parse!(wcif_round["id"])
        competition_event.event_id == event_id and round.number == number
      end
    )
  end

  defp wcif_qualification_to_attrs(nil), do: nil

  defp wcif_qualification_to_attrs(wcif_qualification) do
    %{
      type: wcif_qualification["type"],
      result_type: wcif_qualification["resultType"],
      level: wcif_qualification["level"],
      when_date: wcif_qualification["whenDate"]
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
    venue = Repo.preload(venue, :rooms)

    venue
    |> Venue.changeset(%{
      wcif_id: wcif_venue["id"],
      name: wcif_venue["name"],
      latitude_microdegrees: wcif_venue["latitudeMicrodegrees"],
      longitude_microdegrees: wcif_venue["longitudeMicrodegrees"],
      country_iso2: wcif_venue["countryIso2"],
      timezone: wcif_venue["timezone"]
    })
    |> build_assoc(:rooms, wcif_venue["rooms"],
      with: &room_changeset(&1, &2, competition),
      equality: fn room, wcif_room -> room.wcif_id == wcif_room["id"] end
    )
  end

  defp room_changeset(room, wcif_room, competition) do
    room = Repo.preload(room, :activities)

    room
    |> Room.changeset(%{
      wcif_id: wcif_room["id"],
      name: wcif_room["name"],
      color: wcif_room["color"]
    })
    |> build_assoc(:activities, wcif_room["activities"],
      with: &activity_changeset(&1, &2, competition),
      equality: fn activity, wcif_activity -> activity.wcif_id == wcif_activity["id"] end
    )
  end

  defp activity_changeset(activity, wcif_activity, competition) do
    activity = Repo.preload(activity, :child_activities)

    round =
      if activity.room_id do
        # Link top-level activities (<=> having a room) with the corresponding round.
        # This way every round has an easy access to all the relevant top-level activities,
        # like plain round activities or MBLD/FM attempt activities.
        Competition.find_round_by_activity_code(competition, wcif_activity["activityCode"])
      end

    activity
    |> Activity.changeset(%{
      wcif_id: wcif_activity["id"],
      name: wcif_activity["name"],
      activity_code: wcif_activity["activityCode"],
      start_time: wcif_activity["startTime"],
      end_time: wcif_activity["endTime"]
    })
    |> build_assoc(:child_activities, wcif_activity["childActivities"],
      with: &activity_changeset(&1, &2, competition),
      equality: fn activity, wcif_activity -> activity.wcif_id == wcif_activity["id"] end
    )
    |> put_assoc(:round, round)
  end

  defp person_changeset(person, wcif_person, competition) do
    person = Repo.preload(person, [:results, :registration, :personal_bests, :assignments])

    changeset =
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
        roles: person_roles(person, wcif_person, competition)
      })
      |> build_assoc(:registration, wcif_person["registration"],
        with: &registration_changeset(&1, &2, competition)
      )
      |> build_assoc(:assignments, wcif_person["assignments"],
        with: &assignment_changeset(&1, &2, competition),
        equality: fn assignment, wcif_assignment ->
          assignment.activity.wcif_id == wcif_assignment["activityId"] and
            assignment.assignment_code == wcif_assignment["assignmentCode"]
        end
      )
      |> put_assoc(:results, person_results(person, wcif_person, competition))

    if Competition.over?(competition) do
      # Don't update personal bests once the competition is over,
      # so they stay relevant to the competition date.
      changeset
    else
      changeset
      |> build_assoc(:personal_bests, wcif_person["personalBests"],
        with: &personal_best_changeset(&1, &2, competition),
        equality: fn personal_best, wcif_personal_best ->
          personal_best.event_id == wcif_personal_best["eventId"] and
            personal_best.type == wcif_personal_best["type"]
        end
      )
    end
  end

  defp person_roles(_person, wcif_person, competition) do
    # Staff roles should be synchronized at this point, so we take them.
    staff_member_roles =
      Enum.find_value(competition.staff_members, [], fn staff_member ->
        if staff_member.user.wca_user_id == wcif_person["wcaUserId"] do
          staff_member.roles
        end
      end)

    # Copy any other roles that we don't store in staff members.
    other_wcif_roles = Enum.reject(wcif_person["roles"], &StaffMember.valid_staff_role?/1)

    staff_member_roles ++ other_wcif_roles
  end

  defp registration_changeset(_registration, nil = _wcif_registration, _competition), do: nil

  defp registration_changeset(registration, wcif_registration, competition) do
    registration = Repo.preload(registration, :competition_events)

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

  # Checks for new registration events and adds empty results
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
      |> Enum.filter(fn round ->
        round != nil and Round.open?(round) and not Round.finished?(round)
      end)
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

  # Builds the association given by `name` from `params` and puts that in `changeset`.
  #
  # This is somewhat similar to `Ecto.Changeset.cast_assoc/3`,
  # but better suited for use in this module.
  #
  # ## Options
  #
  # * `with` - the function to build the changeset from params.
  #   Recieves an existing or a newly build struct as the first argument
  #   and the corresponding params as the second argument.
  # * `equality` - compares a struct and a params map to determine
  #   if they represent the same object. Used to correctly link
  #   params with existing structs for a many-style association.
  defp build_assoc(changeset, name, params, opts) do
    build_changeset = Keyword.fetch!(opts, :with)
    new_struct = Ecto.build_assoc(changeset.data, name)

    assoc =
      case Map.get(changeset.types, name) do
        {:assoc, %{cardinality: :one}} ->
          struct = Map.get(changeset.data, name) || new_struct
          build_changeset.(struct, params)

        {:assoc, %{cardinality: :many}} ->
          equality = Keyword.fetch!(opts, :equality)
          structs = Map.get(changeset.data, name)

          Enum.map(params, fn params ->
            struct = Enum.find(structs, new_struct, fn struct -> equality.(struct, params) end)
            build_changeset.(struct, params)
          end)
      end

    put_assoc(changeset, name, assoc)
  end
end
