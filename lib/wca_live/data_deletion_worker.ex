defmodule WcaLive.DataDeletionWorker do
  use GenServer

  require Logger

  def start_link(every: every) do
    GenServer.start_link(__MODULE__, to_timeout(every))
  end

  @impl true
  def init(scheduling_interval) do
    {:ok, scheduling_interval, {:continue, :schedule_next_run}}
  end

  @impl true
  def handle_continue(:schedule_next_run, scheduling_interval) do
    Process.send_after(self(), :run, scheduling_interval)

    {:noreply, scheduling_interval}
  end

  @impl true
  def handle_info(:run, scheduling_interval) do
    delete_old_competitions()

    {:noreply, scheduling_interval, {:continue, :schedule_next_run}}
  end

  defp delete_old_competitions() do
    deleted_count = WcaLive.Competitions.delete_old_competitions()

    if deleted_count > 0 do
      Logger.info("[data deletion] Deleted #{deleted_count} old competitions")
    else
      Logger.info("[data deletion] No old competitions to delete")
    end
  end
end
