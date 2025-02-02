defmodule WcaLive.Competitions.Access do
  @moduledoc """
  Access policies for the Competitions context.
  """

  alias WcaLive.Repo
  alias WcaLive.Competitions
  alias WcaLive.Accounts

  @doc """
  Checks if `user` is allowed to manage `competition` in general,
  kinda like admin in context of this specific competition.
  """
  @spec can_manage_competition?(%Accounts.User{}, %Competitions.Competition{}) :: boolean()
  def can_manage_competition?(user, competition) do
    competition = Repo.preload(competition, :staff_members)
    staff_member = Enum.find(competition.staff_members, &(&1.user_id == user.id))

    Accounts.User.admin?(user) or
      (staff_member != nil and Competitions.StaffMember.manager?(staff_member))
  end
end
