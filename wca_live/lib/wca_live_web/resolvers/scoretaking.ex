defmodule WcaLiveWeb.Resolvers.Scoretaking do
  alias WcaLive.Scoretaking
  alias WcaLive.Competitions
  alias WcaLive.Wca.Format

  # Rounds

  def round_format(%{format_id: format_id}, _args, _resolution) do
    {:ok, Format.get_by_id!(format_id)}
  end

  def round_name(round, _args, _resolution) do
    {:ok, Scoretaking.Round.name(round)}
  end

  def round_label(round, _args, _resolution) do
    {:ok, Scoretaking.Round.label(round)}
  end

  def round_open(round, _args, _resolution) do
    {:ok, Scoretaking.Round.open?(round)}
  end

  def round_finished(round, _args, _resolution) do
    {:ok, Scoretaking.Round.finished?(round)}
  end

  def round_active(round, _args, _resolution) do
    {:ok, Scoretaking.Round.active?(round)}
  end

  def round_next_qualifying(round, _args, _resolution) do
    {:ok, Scoretaking.next_qualifying_to_round(round)}
  end

  def round_advancement_candidates(round, _args, _resolution) do
    {:ok, Scoretaking.advancement_candidates(round)}
  end

  def get_round(_parent, %{id: id}, _resolution) do
    {:ok, Scoretaking.get_round(id)}
  end

  def open_round(_parent, %{id: id}, _resolution) do
    round = Scoretaking.get_round!(id)
    Scoretaking.open_round(round)
  end

  def clear_round(_parent, %{id: id}, _resolution) do
    round = Scoretaking.get_round!(id)
    Scoretaking.clear_round(round)
  end

  def add_person_to_round(_parent, %{round_id: round_id, person_id: person_id}, _resolution) do
    round = Scoretaking.get_round!(round_id)
    person = Competitions.get_person!(person_id)
    Scoretaking.add_person_to_round(person, round)
  end

  def remove_person_from_round(
        _parent,
        %{round_id: round_id, person_id: person_id, replace: replace},
        _resolution
      ) do
    round = Scoretaking.get_round!(round_id)
    person = Competitions.get_person!(person_id)
    Scoretaking.remove_person_from_round(person, round, replace)
  end

  # Results

  def update_result(_parent, %{id: id, input: input}, %{context: %{current_user: current_user}}) do
    result = Scoretaking.get_result!(id)
    Scoretaking.update_result(result, input, current_user)
  end

  # Records

  def list_recent_records(_parent, _args, _resolution) do
    {:ok, Scoretaking.list_recent_records()}
  end
end
