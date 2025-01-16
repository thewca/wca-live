defmodule WcaLive.Wca.Records do
  @moduledoc """
  An abstraction layer on top of the WCA records API.

  Generally prefer functions in `WcaLive.Wca.RecordsStore` as it
  provides a cached version of the records.
  """

  alias WcaLive.Wca

  @typedoc """
  An official WCA regional record, where `:scope` determines the region.
  """
  @type record :: %{
          event_id: String.t(),
          scope: String.t(),
          type: :single | :average,
          attempt_result: integer()
        }

  @typedoc """
  A string uniquely identifying record type.
  """
  @type record_key :: String.t()

  @typedoc """
  A mapping from record identifier to the attempt result.
  """
  @type records_map :: %{record_key() => integer()}

  @doc """
  Fetches official regional records from the WCA API.
  """
  @spec get_regional_records() :: {:ok, list(record())} | {:error, any()}
  def get_regional_records() do
    with {:ok, data} <- Wca.Api.get_records() do
      {:ok, wca_json_to_records(data)}
    end
  end

  defp wca_json_to_records(json) do
    world_records = by_event_json_to_records(json["world_records"], "world")

    continental_records =
      for {continent_wca_id, json} <- json["continental_records"],
          "_" <> continent_name = continent_wca_id,
          record <- by_event_json_to_records(json, continent_name),
          do: record

    national_records =
      for {country_wca_id, json} <- json["national_records"],
          country = Wca.Country.get_by_wca_id!(country_wca_id),
          record <- by_event_json_to_records(json, country.iso2),
          do: record

    world_records ++ continental_records ++ national_records
  end

  defp by_event_json_to_records(json, scope) do
    for {event_id, records_by_type} <- json,
        {type, value} <- records_by_type do
      true = type in ["single", "average"]

      %{
        event_id: event_id,
        scope: scope,
        type: String.to_atom(type),
        attempt_result: value
      }
    end
  end

  @doc """
  Converts a list of records into a map indexed by `record_key/3`.
  """
  @spec records_to_map(list(record())) :: records_map()
  def records_to_map(records) do
    for record <- records,
        into: %{},
        do: {record_key(record.event_id, record.type, record.scope), record.attempt_result}
  end

  @doc """
  Generates a record identifier for the given event and type.

  The `scope` should uniquely identify a continent, country, person, etc.
  """
  @spec record_key(String.t(), :single | :average, String.t()) :: record_key()
  def record_key(event_id, type, scope) do
    event_id <> "#" <> to_string(type) <> "#" <> scope
  end
end
