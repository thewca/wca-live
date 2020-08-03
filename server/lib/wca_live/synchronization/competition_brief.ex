defmodule WcaLive.Synchronization.CompetitionBrief do
  @moduledoc """
  A structure containing a small subset of competition information.

  Used to represent competitions fetched from the WCA API.
  """

  defstruct [:wca_id, :name, :short_name, :start_date, :end_date]

  @type t :: %__MODULE__{
          wca_id: String.t(),
          name: String.t(),
          short_name: String.t(),
          start_date: Date.t(),
          end_date: Date.t()
        }

  @spec from_wca_json(map()) :: t()
  def from_wca_json(json) do
    %__MODULE__{
      wca_id: json["id"],
      name: json["name"],
      short_name: json["short_name"],
      start_date: json["start_date"] |> Date.from_iso8601!(),
      end_date: json["end_date"] |> Date.from_iso8601!()
    }
  end
end
