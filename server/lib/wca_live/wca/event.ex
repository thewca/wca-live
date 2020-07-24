defmodule WcaLive.Wca.Event do
  defstruct [:id, :name, :rank]

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          rank: pos_integer()
        }

  @event_attrs [
    %{
      id: "333",
      name: "3x3x3 Cube",
      rank: 1
    },
    %{
      id: "222",
      name: "2x2x2 Cube",
      rank: 2
    },
    %{
      id: "444",
      name: "4x4x4 Cube",
      rank: 3
    },
    %{
      id: "555",
      name: "5x5x5 Cube",
      rank: 4
    },
    %{
      id: "666",
      name: "6x6x6 Cube",
      rank: 5
    },
    %{
      id: "777",
      name: "7x7x7 Cube",
      rank: 6
    },
    %{
      id: "333bf",
      name: "3x3x3 Blindfolded",
      rank: 7
    },
    %{
      id: "333fm",
      name: "3x3x3 Fewest Moves",
      rank: 8
    },
    %{
      id: "333oh",
      name: "3x3x3 One-Handed",
      rank: 9
    },
    %{
      id: "clock",
      name: "Clock",
      rank: 10
    },
    %{
      id: "minx",
      name: "Megaminx",
      rank: 11
    },
    %{
      id: "pyram",
      name: "Pyraminx",
      rank: 12
    },
    %{
      id: "skewb",
      name: "Skewb",
      rank: 13
    },
    %{
      id: "sq1",
      name: "Square-1",
      rank: 14
    },
    %{
      id: "444bf",
      name: "4x4x4 Blindfolded",
      rank: 15
    },
    %{
      id: "555bf",
      name: "5x5x5 Blindfolded",
      rank: 16
    },
    %{
      id: "333mbf",
      name: "3x3x3 Multi-Blind",
      rank: 17
    },
    %{
      id: "333ft",
      name: "3x3x3 With Feet",
      rank: 18
    }
  ]

  def get_by_id!(id) do
    @event_attrs
    |> Enum.find(fn event -> event.id == id end)
    |> case do
      nil ->
        raise ArgumentError, message: "Invalid event id \"#{id}\"."

      attrs ->
        struct(__MODULE__, attrs)
    end
  end

  def get_rank_by_id!(id) do
    event = get_by_id!(id)
    event.rank
  end
end
