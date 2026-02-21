defmodule WcaLive.Wca.Format do
  @moduledoc """
  A WCA format applied in the given round.

  Describes how many attempts competitors do
  and whether best or average determines ranking.
  """

  defstruct [:id, :name, :short_name, :number_of_attempts, :sort_by]

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          short_name: String.t(),
          number_of_attempts: integer(),
          sort_by: atom()
        }

  format_attrs = [
    %{
      id: "1",
      name: "Best of 1",
      short_name: "Bo1",
      number_of_attempts: 1,
      sort_by: :best
    },
    %{
      id: "2",
      name: "Best of 2",
      short_name: "Bo2",
      number_of_attempts: 2,
      sort_by: :best
    },
    %{
      id: "3",
      name: "Best of 3",
      short_name: "Bo3",
      number_of_attempts: 3,
      sort_by: :best
    },
    %{
      id: "5",
      name: "Best of 5",
      short_name: "Bo5",
      number_of_attempts: 5,
      sort_by: :best
    },
    %{
      id: "m",
      name: "Mean of 3",
      short_name: "Mo3",
      number_of_attempts: 3,
      sort_by: :average
    },
    %{
      id: "a",
      name: "Average of 5",
      short_name: "Ao5",
      number_of_attempts: 5,
      sort_by: :average
    },
    %{
      id: "h",
      name: "Head-to-Head",
      short_name: "H2H",
      # Note: the below is not accurate for H2H, but we need to have
      # any format information to avoid crashing on competitions with
      # a h2h format present. H2H support will come later as part of
      # the new system.
      number_of_attempts: 5,
      sort_by: :average
    }
  ]

  @format_attrs_by_id Map.new(format_attrs, &{&1.id, &1})

  @doc """
  Finds format with matching id.

  Raises an error if no format is found.
  """
  @spec get_by_id!(String.t()) :: t()
  def get_by_id!(id) do
    if attrs = @format_attrs_by_id[id] do
      struct(__MODULE__, attrs)
    else
      raise ArgumentError, message: "invalid format id #{inspect(id)}"
    end
  end
end
