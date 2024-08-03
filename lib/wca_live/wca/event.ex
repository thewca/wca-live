defmodule WcaLive.Wca.Event do
  @moduledoc """
  A WCA event that may be held at a competition.
  """

  # `rank` determines the preferred events order.
  defstruct [:id, :name, :rank]

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          rank: pos_integer()
        }

  event_attrs = [
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
    # Old events
    %{
      id: "333ft",
      name: "3x3x3 With Feet",
      rank: 18
    },
    %{
      id: "magic",
      name: "Magic",
      rank: 19
    },
    %{
      id: "mmagic",
      name: "Master Magic",
      rank: 20
    },
    %{
      id: "333mbo",
      name: "3x3x3 Multi-Blind Old Style",
      rank: 21
    }
  ]

  @event_attrs_by_id Map.new(event_attrs, &{&1.id, &1})

  @doc """
  Finds an event with matching WCA id.

  Raises an error if no event is found.
  """
  @spec get_by_id!(String.t()) :: t()
  def get_by_id!(id) do
    if attrs = @event_attrs_by_id[id] do
      struct(__MODULE__, attrs)
    else
      raise ArgumentError, message: "invalid event id #{inspect(id)}"
    end
  end

  @doc """
  Finds an event by id and returns its rank.

  Raises an error if no event is found.
  """
  @spec get_rank_by_id!(String.t()) :: integer()
  def get_rank_by_id!(id) do
    event = get_by_id!(id)
    event.rank
  end
end
