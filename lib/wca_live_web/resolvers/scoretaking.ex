defmodule WcaLiveWeb.Resolvers.Scoretaking do
  alias WcaLive.Scoretaking
  alias WcaLive.Wca.{Format, Event}

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

  def round_num_entered_results(round, _args, _resolution) do
    {:ok, Scoretaking.Round.num_entered_results(round)}
  end

  def round_num_results(round, _args, _resolution) do
    {:ok, length(round.results)}
  end

  def round_active(round, _args, _resolution) do
    {:ok, Scoretaking.Round.active?(round)}
  end

  def round_next_qualifying(round, _args, _resolution) do
    {:ok, Scoretaking.Advancing.next_qualifying_to_round(round)}
  end

  def round_advancement_candidates(round, _args, _resolution) do
    {:ok, Scoretaking.Advancing.advancement_candidates(round)}
  end

  def get_round(_parent, %{id: id}, _resolution) do
    round = Scoretaking.get_round(id)
    {:ok, round}
  end

  # Records

  def list_recent_records(_parent, _args, _resolution) do
    {:ok, Scoretaking.list_recent_records()}
  end

  def official_world_records(_parent, _args, _resolution) do
    records = WcaLive.Wca.RecordsStore.get_regional_records()
    world_records = Enum.filter(records, &(&1.scope == "world"))
    {:ok, world_records}
  end

  def record_event(%{event_id: event_id}, _args, _resolution) do
    {:ok, Event.get_by_id!(event_id)}
  end
end
