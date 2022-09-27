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

  @format_attrs [
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
    }
  ]

  @doc """
  Finds format with matching id.

  Raises an error if no format is found.
  """
  @spec get_by_id!(String.t()) :: t()
  def get_by_id!(id) do
    @format_attrs
    |> Enum.find(fn format -> format.id == id end)
    |> case do
      nil ->
        raise ArgumentError, message: "invalid format id '#{id}'"

      attrs ->
        struct(__MODULE__, attrs)
    end
  end
end
