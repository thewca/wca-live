defmodule WcaLive.Scoretaking.Access do
  @moduledoc """
  Access policies for the Scoretaking context.
  """

  alias WcaLive.Repo
  alias WcaLive.Competitions
  alias WcaLive.Competitions.{StaffMember, Competition}
  alias WcaLive.Scoretaking.{Round, Result}
  alias WcaLive.Accounts.User

  @doc """
  Checks if `user` is allowed to perform scoretaking tasks at `competition`.
  """
  @spec can_scoretake_competition?(%User{}, %Competition{}) :: boolean()
  def can_scoretake_competition?(user, competition) do
    competition = Repo.preload(competition, :staff_members)
    staff_member = Enum.find(competition.staff_members, &(&1.user_id == user.id))

    Competitions.Access.can_manage_competition?(user, competition) or
      (staff_member != nil and StaffMember.scoretaker?(staff_member))
  end

  @doc """
  Checks if `user` is allowed to manage `round`.
  """
  @spec can_manage_round?(%User{}, %Round{}) :: boolean()
  def can_manage_round?(user, round) do
    round = Repo.preload(round, competition_event: :competition)
    can_scoretake_competition?(user, round.competition_event.competition)
  end

  @doc """
  Checks if `user` is allowed to manage `result`.
  """
  @spec can_manage_result?(%User{}, %Result{}) :: boolean()
  def can_manage_result?(user, result) do
    result = Repo.preload(result, :round)
    can_manage_round?(user, result.round)
  end
end
