defmodule WcaLive.Wca.RecordsStore do
  use GenServer

  require Logger
  alias WcaLive.Wca

  @name __MODULE__

  @type state :: %{
          records: Records.Utils.records(),
          updated_at: DateTime.t()
        }

  @state_path "tmp/record-store.data"
  @update_interval_sec 1 * 60 * 60

  # Client API

  def start_link(opts \\ []) do
    GenServer.start_link(@name, opts, name: @name)
  end

  def get_regional_records() do
    GenServer.call(@name, :get_records)
  end

  # Callbacks

  @impl true
  def init(_) do
    state = get_initial_state!()

    updated_ago = DateTime.diff(DateTime.utc_now(), state.updated_at, :second)
    update_in = max(@update_interval_sec - updated_ago, 0)

    schedule_update(update_in)

    {:ok, state}
  end

  @impl true
  def handle_call(:get_records, _from, %{records: records} = state) do
    {:reply, records, state}
  end

  @impl true
  def handle_info(:update, state) do
    case update_state() do
      {:ok, new_state} ->
        log("Updated records.")
        schedule_update(@update_interval_sec)
        {:noreply, new_state}

      {:error, error} ->
        log("Update failed: #{error}.")
        schedule_update(@update_interval_sec)
        {:noreply, state}
    end
  end

  defp schedule_update(seconds) do
    # In 1 hour
    Process.send_after(self(), :update, seconds * 1000)
  end

  # Internal state management

  defp get_initial_state!() do
    if File.exists?(@state_path) do
      read_state!()
    else
      case update_state() do
        {:ok, state} -> state
        {:error, message} -> raise RuntimeError, message: message
      end
    end
  end

  defp read_state!() do
    log("Reading state from file.")
    binary = File.read!(@state_path)
    :erlang.binary_to_term(binary)
  end

  defp write_state!(state) do
    log("Writing state to file.")
    File.mkdir_p!(Path.dirname(@state_path))
    binary = :erlang.term_to_binary(state)
    File.write!(@state_path, binary)
  end

  defp fetch_records() do
    log("Fetching fresh records.")
    Wca.Records.get_regional_records()
  end

  defp update_state() do
    with {:ok, records} <- fetch_records() do
      state = %{records: records, updated_at: DateTime.utc_now()}
      write_state!(state)
      {:ok, state}
    end
  end

  defp log(message) do
    Logger.info("[RecordsStore] #{message}")
  end
end
