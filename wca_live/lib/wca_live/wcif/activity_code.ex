defmodule WcaLive.Wcif.ActivityCode do
  defmodule Official do
    defstruct [:event_id, :round_number, :group_name, :attempt_number]

    @type t :: %__MODULE__{
            event_id: String.t(),
            round_number: integer() | nil,
            group_name: String.t() | nil,
            attempt_number: integer() | nil
          }

    defimpl String.Chars do
      def to_string(%Official{
            event_id: event_id,
            round_number: round_number,
            group_name: group_name,
            attempt_number: attempt_number
          }) do
        [
          event_id,
          round_number && "-r#{round_number}",
          group_name && "-g#{group_name}",
          attempt_number && "-a#{attempt_number}"
        ]
        |> Enum.reject(&is_nil/1)
        |> Enum.join()
      end
    end
  end

  defmodule Other do
    defstruct [:id]

    @type t :: %__MODULE__{id: String.t()}

    defimpl String.Chars do
      def to_string(%Other{id: id}), do: "other-" <> id
    end
  end

  @type t :: Official.t() | Other.t()

  @spec parse!(String.t()) :: t()
  def parse!("other-" <> id), do: %Other{id: id}

  def parse!(activity_code) do
    ~r/^(\w+)((?:-r\d+)?)((?:-g\d+)?)((?:-a\d+)?)$/
    |> Regex.run(activity_code)
    |> case do
      nil ->
        raise ArgumentError, message: "Invalid activity code \"#{activity_code}\"."

      [_, event_id, r, g, a] ->
        round_number =
          case r do
            "" -> nil
            "-r" <> number -> String.to_integer(number)
          end

        group_name =
          case g do
            "" -> nil
            "-g" <> name -> name
          end

        attempt_number =
          case a do
            "" -> nil
            "-a" <> number -> String.to_integer(number)
          end

        %Official{
          event_id: event_id,
          round_number: round_number,
          group_name: group_name,
          attempt_number: attempt_number
        }
    end
  end

  def is_round?(%Official{} = ac) do
    ac.event_id != nil and ac.round_number != nil and
      ac.group_name == nil and ac.attempt_number == nil
  end

  def is_round?(_), do: false
end
