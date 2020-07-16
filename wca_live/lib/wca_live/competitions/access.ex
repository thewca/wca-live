defmodule WcaLive.Competitions.Access do
  alias WcaLive.Repo
  alias WcaLive.Competitions.StaffMember
  alias WcaLive.Accounts.User

  def can_manage_competition?(user, competition) do
    competition = Repo.preload(competition, :staff_members)
    staff_member = Enum.find(competition.staff_members, &(&1.user_id == user.id))
    User.admin?(user) or (staff_member != nil and StaffMember.manager?(staff_member))
  end
end
