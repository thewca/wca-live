defmodule WcaLive.Scoretaking.Access do
  alias WcaLive.Repo
  alias WcaLive.Competitions
  alias WcaLive.Competitions.StaffMember

  def can_scoretake_competition?(user, competition) do
    competition = Repo.preload(competition, :staff_members)
    staff_member = Enum.find(competition.staff_members, &(&1.user_id == user.id))

    Competitions.Access.can_manage_competition?(user, competition) or
      (staff_member != nil and StaffMember.scoretaker?(staff_member))
  end

  def can_manage_round?(user, round) do
    round = Repo.preload(round, competition_event: :competition)
    can_scoretake_competition?(user, round.competition_event.competition)
  end

  def can_manage_result?(user, result) do
    result = Repo.preload(result, :round)
    can_manage_round?(user, result.round)
  end
end
