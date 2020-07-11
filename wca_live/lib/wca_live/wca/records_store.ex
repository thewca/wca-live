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
    schedule_update()

    {:ok, get_initial_state()}
  end

  @impl true
  def handle_call(:get_records, _from, %{records: records} = state) do
    {:reply, records, state}
  end

  @impl true
  def handle_info(:update, _state) do
    {:ok, state} = update_state()

    schedule_update()

    {:noreply, state}
  end

  defp schedule_update do
    # In 1 hour
    Process.send_after(self(), :update, 1 * 60 * 60 * 1000)
  end

  # Internal state management

  defp get_initial_state() do
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
    Logger.info("[RecordsStore] Reading state from file.")
    binary = File.read!(@state_path)
    :erlang.binary_to_term(binary)
  end

  defp write_state!(state) do
    Logger.info("[RecordsStore] Writing state to file.")
    File.mkdir_p!(Path.dirname(@state_path))
    binary = :erlang.term_to_binary(state)
    File.write!(@state_path, binary)
  end

  defp fetch_records() do
    Logger.info("[RecordsStore] Fetching fresh records.")
    Wca.Records.get_regional_records()
  end

  defp update_state() do
    with {:ok, records} <- fetch_records() do
      state = %{records: records, updated_at: DateTime.utc_now()}
      write_state!(state)
      {:ok, state}
    end
  end
end
