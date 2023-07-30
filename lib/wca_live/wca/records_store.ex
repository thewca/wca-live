defmodule WcaLive.Wca.RecordsStore do
  @moduledoc """
  A caching layer on top of `WcaLive.Wca.Records`.

  The server periodically fetches regional records from the WCA API.
  The records are stored in memory for fast access, avoiding a web
  request. Also, the records are persisted in the database, so that
  they can be used as the initial on future application startups.
  This is particularly important when WCA API is temporarily down.
  """

  use GenServer

  require Logger

  alias WcaLive.Wca

  @name __MODULE__

  # Bump this whenever the persisted state changes
  @version 1

  @type state :: %{
          records_map: Wca.Records.records_map(),
          records: list(Wca.Records.record()),
          updated_at: DateTime.t()
        }

  @storage_key "records_store"

  # 1 hour
  @update_interval_in_seconds 1 * 60 * 60

  @records_key {__MODULE__, :records}
  @records_map_key {__MODULE__, :records_map}

  # Client API

  def start_link(opts \\ []) do
    GenServer.start_link(@name, opts, name: @name)
  end

  @doc """
  Returns a cached version of regional records fetched from the WCA API.
  """
  @spec get_regional_records() :: list(Wca.Records.record())
  def get_regional_records() do
    :persistent_term.get(@records_key)
  end

  @doc """
  Returns a cached version of regional records map.
  """
  @spec get_regional_records_map() :: Wca.Records.records_map()
  def get_regional_records_map() do
    :persistent_term.get(@records_map_key)
  end

  # Callbacks

  @impl true
  def init(_) do
    state = get_initial_state!()
    state |> scheduled_update_in() |> schedule_update()
    {:ok, state}
  end

  @impl true
  def handle_info(:update, state) do
    case update_state() do
      {:ok, new_state} ->
        log("Updated records.")
        state |> scheduled_update_in() |> schedule_update()
        {:noreply, new_state}

      {:error, error} ->
        log("Update failed: #{error}.")
        schedule_update(@update_interval_in_seconds)
        {:noreply, state}
    end
  end

  defp schedule_update(seconds) do
    Process.send_after(self(), :update, seconds * 1000)
  end

  defp scheduled_update_in(state) do
    updated_ago = DateTime.diff(DateTime.utc_now(), state.updated_at, :second)
    max(@update_interval_in_seconds - updated_ago, 0)
  end

  defp get_initial_state!() do
    case fetch_state() do
      {:ok, state} ->
        put_state_in_persistent_term(state)
        state

      :error ->
        case update_state() do
          {:ok, state} -> state
          {:error, message} -> raise RuntimeError, message: message
        end
    end
  end

  defp update_state() do
    :global.trans({:records_store_update, node()}, fn ->
      with {:ok, state} <- fetch_state(),
           # The state may have been updated by another node
           true <- scheduled_update_in(state) > 0 do
        {:ok, state}
      else
        _ ->
          log("Fetching fresh records.")

          with {:ok, records} <- Wca.Records.get_regional_records() do
            records_map = Wca.Records.records_to_map(records)

            state = %{
              records_map: records_map,
              records: records,
              updated_at: DateTime.utc_now()
            }

            put_state_in_persistent_term(state)
            log("Persisting state.")
            persist_state(state)
            {:ok, state}
          end
      end
    end)
  end

  defp fetch_state() do
    case WcaLive.Storage.fetch(@storage_key) do
      {:ok, {@version, state}} -> {:ok, state}
      _ -> :error
    end
  end

  defp persist_state(state) do
    WcaLive.Storage.put(@storage_key, {@version, state})
  end

  defp put_state_in_persistent_term(state) do
    :persistent_term.put(@records_key, state.records)
    :persistent_term.put(@records_map_key, state.records_map)
  end

  defp log(message) do
    Logger.info("[RecordsStore] #{message}")
  end
end
