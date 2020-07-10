defmodule WcaLiveWeb.Resolvers.Rounds do
  alias WcaLive.Competitions

  def round_format(%{format_id: format_id}, _args, _resolution) do
    {:ok, Competitions.Format.get_by_id!(format_id)}
  end

  def round_name(round, _args, _resolution) do
    {:ok, Competitions.Round.name(round)}
  end

  def round_label(round, _args, _resolution) do
    {:ok, Competitions.Round.label(round)}
  end

  def round_open(round, _args, _resolution) do
    {:ok, Competitions.Round.open?(round)}
  end

  def round_finished(round, _args, _resolution) do
    {:ok, Competitions.Round.finished?(round)}
  end

  def round_active(round, _args, _resolution) do
    {:ok, Competitions.Round.active?(round)}
  end

  def get_round(_parent, %{id: id}, _resolution) do
    {:ok, Competitions.get_round(id)}
  end

  def open_round(_parent, %{id: id}, _resolution) do
    round = Competitions.get_round!(id)
    Competitions.open_round(round)
  end
end
