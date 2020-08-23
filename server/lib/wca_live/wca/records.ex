defmodule WcaLive.Wca.Records do
  @moduledoc """
  An abstraction layer on top of the WCA records API.
  """

  alias WcaLive.Wca

  @typedoc """
  A string uniquely identifying record type.
  """
  @type record_key :: String.t()

  @typedoc """
  A mapping from record identifier to the attempt result.
  """
  @type records :: %{record_key() => integer()}

  @doc """
  Fetches official regional records from the WCA API
  and converts them to the mapping form.

  Generally prefer `WcaLive.Wca.RecordsStore.get_regional_records/0`
  as it provides a cached version.
  """
  @spec get_regional_records() :: {:ok, records()} | {:error, any()}
  def get_regional_records() do
    with {:ok, data} <- Wca.Api.get_records() do
      {:ok, wca_json_to_records(data)}
    end
  end

  defp wca_json_to_records(json) do
    world_records = by_event_json_to_records(json["world_records"], "world")

    continental_records =
      json["continental_records"]
      |> Enum.map(fn {continent_wca_id, json} ->
        "_" <> continent_name = continent_wca_id
        by_event_json_to_records(json, continent_name)
      end)
      |> Enum.reduce(%{}, &Map.merge/2)

    national_records =
      json["national_records"]
      |> Enum.map(fn {country_wca_id, json} ->
        country = Wca.Country.get_by_wca_id!(country_wca_id)
        by_event_json_to_records(json, country.iso2)
      end)
      |> Enum.reduce(%{}, &Map.merge/2)

    world_records
    |> Map.merge(continental_records)
    |> Map.merge(national_records)
  end

  defp by_event_json_to_records(json, scope) do
    json
    |> Enum.flat_map(fn {event_id, records_by_type} ->
      Enum.map(records_by_type, fn {type, value} -> {event_id, type, value} end)
    end)
    |> Map.new(fn {event_id, type, value} ->
      {record_key(event_id, type, scope), value}
    end)
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
