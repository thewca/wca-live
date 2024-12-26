defmodule WcaLive.CompetitionsTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Competitions

  test "list_competitions/1 given no args returns all competitions" do
    competitions = insert_list(5, :competition)

    assert ids(competitions) == ids(Competitions.list_competitions())
  end

  test "list_competitions/1 given :limit returns the specified subset of competitions" do
    insert_list(5, :competition)

    list = Competitions.list_competitions(%{limit: 2})

    assert 2 == length(list)
  end

  test "list_competitions/1 given :filter returns competitions with matching name" do
    worlds = insert(:competition, name: "World Championship 2020")
    open = insert(:competition, name: "WHAT Open 2020")
    euro = insert(:competition, name: "Euro Championship 2020")

    list = Competitions.list_competitions(%{filter: "champion"})

    assert worlds.id in ids(list)
    assert open.id not in ids(list)
    assert euro.id in ids(list)

    list = Competitions.list_competitions(%{filter: " championship  2022  "})

    assert worlds.id in ids(list)
    assert open.id not in ids(list)
    assert euro.id in ids(list)
  end

  test "list_competitions/1 given :from returns competitions from that date inclusive" do
    first = insert(:competition, start_date: ~D[2020-01-10])
    second = insert(:competition, start_date: ~D[2020-04-20])
    third = insert(:competition, start_date: ~D[2020-05-15])

    list = Competitions.list_competitions(%{from: ~D[2020-04-20]})

    assert first.id not in ids(list)
    assert second.id in ids(list)
    assert third.id in ids(list)
  end

  test "get_competition/1 returns competition with the given id" do
    competition = insert(:competition)

    assert competition.id == Competitions.get_competition(competition.id).id
  end

  test "fetch_competition/1 returns competition with the given id in a tuple" do
    competition = insert(:competition)

    assert {:ok, found} = Competitions.fetch_competition(competition.id)
    assert competition.id == found.id
  end

  test "get_person/1 returns person with the given id" do
    person = insert(:person)

    assert person.id == Competitions.get_person(person.id).id
  end

  test "get_person/1 returns person with the given id in a tuple" do
    person = insert(:person)

    assert {:ok, found} = Competitions.fetch_person(person.id)
    assert person.id == found.id
  end

  test "update_competition/2 given valid attributes updates the competition" do
    competition = insert(:competition, name: "Current Name 2020")

    assert {:ok, updated} = Competitions.update_competition(competition, %{name: "New Name 2020"})
    assert updated.name == "New Name 2020"
  end

  test "update_competition/2 given invalid attributes returns changeset" do
    competition = insert(:competition)

    assert {:error, %Ecto.Changeset{}} = Competitions.update_competition(competition, %{name: ""})
  end

  test "update_competition/2 given staff member attributes saves them" do
    competition = insert(:competition)
    staff_member1 = insert(:staff_member, competition: competition, roles: ["organizer"])
    _staff_member2 = insert(:staff_member, competition: competition)

    staff_member_attrs = [
      %{id: staff_member1.id, roles: ["delegate"]}
    ]

    assert {:ok, updated} =
             Competitions.update_competition(competition, %{staff_members: staff_member_attrs})

    assert [staff_member] = updated.staff_members
    assert staff_member1.id == staff_member.id
    assert ["delegate"] == staff_member.roles
  end

  defp ids(list) do
    list |> Enum.map(& &1.id) |> Enum.sort()
  end
end
