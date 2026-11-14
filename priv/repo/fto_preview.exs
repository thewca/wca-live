# Local-only, repeatable preview data. Existing preview results are preserved.
# Run with: mix run --no-start priv/repo/fto_preview.exs
if Mix.env() != :dev, do: raise("FTO preview data can only be created in development")

{:ok, _} = Application.ensure_all_started(:ecto_sql)
{:ok, _} = Application.ensure_all_started(:ex_machina)
{:ok, _} = WcaLive.Repo.start_link()
Code.require_file("test/support/factory.ex")

defmodule FtoPreview do
  alias WcaLive.{Accounts, Competitions, Factory, Repo, Scoretaking, Storage, Wca}

  def run do
    # An empty local record cache lets the preview start without the WCA API.
    Storage.put("records_store", {
      1,
      %{records: [], records_map: %{}, updated_at: DateTime.utc_now()}
    })

    competition =
      Repo.get_by(Competitions.Competition, wca_id: "LocalFTOPreview") || create_competition()

    user = Repo.get!(Accounts.User, competition.imported_by_id)
    {:ok, code} = Accounts.generate_one_time_code(user)

    IO.puts("""

    FTO preview: http://localhost:3000/competitions/#{competition.id}
    Local admin: #{user.name}
    One-time sign-in code (valid for 2 minutes): #{code.code}
    Existing preview results are preserved when this script is rerun.
    """)
  end

  defp create_competition do
    now = DateTime.utc_now() |> DateTime.truncate(:second)
    start_time = DateTime.add(now, -2, :hour)
    date = DateTime.to_date(now)

    Repo.transaction(fn ->
      user =
        Factory.insert(:user,
          name: "Local FTO Preview Admin",
          email: "fto-preview@example.test",
          wca_user_id: 900_000_001,
          wca_teams: ["wst"],
          avatar_url: nil,
          avatar_thumb_url: nil
        )

      competition =
        Factory.insert(:competition,
          wca_id: "LocalFTOPreview",
          name: "Local FTO Preview (Mock Competition)",
          short_name: "Local FTO Preview",
          imported_by: user,
          start_date: date,
          end_date: date,
          start_time: start_time,
          end_time: DateTime.add(now, 2, :hour),
          synchronized_at: now,
          competitor_limit: 12
        )

      Factory.insert(:staff_member, competition: competition, user: user, roles: ["organizer"])
      fto = Factory.insert(:competition_event, competition: competition, event_id: "fto")
      cube = Factory.insert(:competition_event, competition: competition, event_id: "333")

      first =
        Factory.insert(:round,
          competition_event: fto,
          number: 1,
          cutoff: Factory.build(:cutoff, attempt_result: 9000, number_of_attempts: 2),
          time_limit: Factory.build(:time_limit, centiseconds: 18000),
          advancement_condition: Factory.build(:advancement_condition, type: "ranking", level: 6)
        )

      final =
        Factory.insert(:round,
          competition_event: fto,
          number: 2,
          cutoff: nil,
          time_limit: Factory.build(:time_limit, centiseconds: 18000),
          advancement_condition: nil
        )

      cube_round =
        Factory.insert(:round,
          competition_event: cube,
          cutoff: nil,
          advancement_condition: nil
        )

      venue =
        Factory.insert(:venue,
          competition: competition,
          name: "Mock Community Center",
          country_iso2: "US",
          timezone: "America/Los_Angeles",
          latitude_microdegrees: 47_606_200,
          longitude_microdegrees: -122_332_100
        )

      room = Factory.insert(:room, venue: venue, name: "FTO Stage", color: "#6750a4")

      for {round, event_id, offset, title} <- [
            {first, "fto", 0, "Face Turning Octahedron - First Round"},
            {cube_round, "333", 1, "3x3x3 Cube - Final"},
            {final, "fto", 2, "Face Turning Octahedron - Final"}
          ] do
        Factory.insert(:activity,
          room: room,
          round: round,
          wcif_id: offset + 1,
          name: title,
          activity_code: "#{event_id}-r#{round.number}",
          start_time: DateTime.add(start_time, offset, :hour),
          end_time: DateTime.add(start_time, offset + 1, :hour)
        )
      end

      names = [
        "Alex Rivera",
        "Sam Chen",
        "Jordan Patel",
        "Morgan Lee",
        "Casey Williams",
        "Taylor Kim",
        "Riley Garcia",
        "Jamie Singh",
        "Avery Wilson",
        "Quinn Martin",
        "Drew Nguyen",
        "Skyler Brown"
      ]

      for {name, n} <- Enum.with_index(names, 1) do
        person =
          Factory.insert(:person,
            competition: competition,
            registrant_id: n,
            wca_user_id: 900_001_000 + n,
            name: name,
            email: "competitor-#{n}@example.test",
            country_iso2: Enum.at(["US", "CA", "GB", "AU"], rem(n - 1, 4)),
            avatar_url: nil,
            avatar_thumb_url: nil
          )

        Factory.insert(:registration,
          person: person,
          status: "accepted",
          comments: "Fictional local preview competitor",
          competition_events: [fto, cube]
        )

        attempts =
          case n do
            10 -> [9500, 10200]
            11 -> [6500, -1, 6900, -1, 7200]
            12 -> [-2, 8800, 8400, 9100, 8600]
            _ -> Enum.map([3000, 3200, 3100, 3500, 2900], &(&1 + n * 180))
          end

        insert_result(first, person, user, "fto", attempts, now)

        insert_result(
          cube_round,
          person,
          user,
          "333",
          Enum.map([1100, 1200, 1050, 1300, 1150], &(&1 + n * 25)),
          now
        )

        if n <= 6 do
          final_attempts =
            cond do
              n <= 3 -> Enum.map([2900, 3100, 3000, 3300, 2800], &(&1 + n * 150))
              n == 4 -> [3400, -1, 3200]
              true -> []
            end

          insert_result(final, person, user, "fto", final_attempts, now)
        end
      end

      for round <- [first, cube_round, final] do
        round |> Scoretaking.Ranking.compute_ranking() |> Repo.update!()
        round |> Scoretaking.Advancing.compute_advancing() |> Repo.update!()
      end

      competition
    end)
    |> case do
      {:ok, competition} -> competition
      {:error, reason} -> raise "Could not create FTO preview: #{inspect(reason)}"
    end
  end

  defp insert_result(round, person, user, event_id, attempts, now) do
    %Scoretaking.Result{}
    |> Scoretaking.Result.changeset(
      %{attempts: Enum.map(attempts, &%{result: &1})},
      event_id,
      Wca.Format.get_by_id!("a"),
      round.time_limit,
      round.cutoff
    )
    |> Ecto.Changeset.change(
      person_id: person.id,
      round_id: round.id,
      entered_by_id: user.id,
      entered_at: if(attempts == [], do: nil, else: now)
    )
    |> Repo.insert!()
  end
end

FtoPreview.run()
