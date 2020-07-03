defmodule WcaLive.Competitions.Format do
  defstruct [:id, :name, :short_name, :solve_count, :sort_by]

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          short_name: String.t(),
          solve_count: integer(),
          sort_by: String.t()
        }

  @format_attrs [
    %{
      id: "1",
      name: "Best of 1",
      short_name: "Bo1",
      solve_count: 1,
      sort_by: "best"
    },
    %{
      id: "2",
      name: "Best of 2",
      short_name: "Bo2",
      solve_count: 2,
      sort_by: "best"
    },
    %{
      id: "3",
      name: "Best of 3",
      short_name: "Bo3",
      solve_count: 3,
      sort_by: "best"
    },
    %{
      id: "m",
      name: "Mean of 3",
      short_name: "Mo3",
      solve_count: 3,
      sort_by: "average"
    },
    %{
      id: "a",
      name: "Average of 5",
      short_name: "Ao5",
      solve_count: 5,
      sort_by: "average"
    }
  ]

  def get_by_id!(id) do
    @format_attrs
    |> Enum.find(fn format -> format.id == id end)
    |> case do
      nil ->
        raise ArgumentError, message: "Invalid format id \"#{id}\"."

      attrs ->
        struct(__MODULE__, attrs)
    end
  end
end
