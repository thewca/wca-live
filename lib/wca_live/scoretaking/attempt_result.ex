defmodule WcaLive.Scoretaking.AttemptResult do
  @moduledoc """
  The actual time/score achieved by competitor during his attempt.

  An attempt result is an integer that represents:

    * for 3x3x3 Fewest Moves - The number of moves it took to solve the cube.
    * for 3x3x3 Multi-Blind - Encoded information about:
        - the number of attempted cubes
        - the number of solved cubes
        - the number of centiseconds the attempt took

      The integer is designed so that lower value represents a better result.
    * for any other event - the number of centiseconds it took to solve the cube
  """

  @type attempt_result :: integer()

  # Represents an attempt that is supposed to happen in the future
  # or is not gonna happen (e.g. due to cutoff).
  @skipped_value 0
  @dnf_value -1
  @dns_value -2

  @spec skipped() :: attempt_result()
  def skipped(), do: @skipped_value

  @spec dnf() :: attempt_result()
  def dnf(), do: @dnf_value

  @spec dns() :: attempt_result()
  def dns(), do: @dns_value

  @spec complete?(attempt_result()) :: boolean()
  def complete?(attempt_result), do: attempt_result > 0

  @spec skipped?(attempt_result()) :: boolean()
  def skipped?(attempt_result), do: attempt_result == @skipped_value

  @spec dnf?(attempt_result()) :: boolean()
  def dnf?(attempt_result), do: attempt_result == @dnf_value

  @spec dns?(attempt_result()) :: boolean()
  def dns?(attempt_result), do: attempt_result == @dns_value

  @doc """
  Checks if the first attempt result is strictly better than the other.
  """
  @spec better?(attempt_result(), attempt_result()) :: boolean()
  def better?(attempt_result1, attempt_result2) do
    to_monotonic(attempt_result1) < to_monotonic(attempt_result2)
  end

  @doc """
  Converts `attempt_result` to a value that can be
  compared with standard comparison operators.

  Values like DNF and DNS are negative and it doesn't
  make sense to compare them with successful attempt results.
  This method is useful for easier comparison and sorting.
  """
  @spec to_monotonic(attempt_result()) :: term()
  def to_monotonic(attempt_result) do
    if complete?(attempt_result) do
      attempt_result
    else
      # Note: in Elixir every number is lower than any given atom.
      :incomplete
    end
  end

  @doc """
  Returns the specified number of attempt results
  filling missing ones with skipped value.
  """
  @spec pad_skipped(list(attempt_result()), pos_integer()) :: list(attempt_result())
  def pad_skipped(attempt_results, number_of_attempts)
      when length(attempt_results) > number_of_attempts do
    Enum.take(attempt_results, number_of_attempts)
  end

  def pad_skipped(attempt_results, number_of_attempts) do
    missing = number_of_attempts - length(attempt_results)
    attempt_results ++ List.duplicate(@skipped_value, missing)
  end

  @doc """
  Returns the best attempt result in the given list.
  """
  @spec best(list(attempt_result())) :: attempt_result()
  def best(attempt_results) do
    non_skipped = Enum.reject(attempt_results, &skipped?/1)
    complete = Enum.filter(attempt_results, &complete?/1)

    cond do
      Enum.empty?(non_skipped) -> @skipped_value
      not Enum.empty?(complete) -> Enum.min(complete)
      true -> Enum.max(non_skipped)
    end
  end

  @doc """
  Returns the average of the given attempt results.

  Calculates either Mean of 3 or Average of 5 depending on
  the number of the given attempt results.
  """
  @spec average(list(attempt_result()), String.t()) :: attempt_result()
  def average(_attempt_results, "333mbf"), do: @skipped_value

  def average(attempt_results, "333fm") do
    if Enum.any?(attempt_results, &skipped?/1) do
      @skipped_value
    else
      scaled = Enum.map(attempt_results, &(&1 * 100))

      case length(scaled) do
        3 -> mean_of_3(scaled)
        5 -> average_of_5(scaled)
      end
    end
  end

  def average(attempt_results, _event_id) do
    if Enum.any?(attempt_results, &skipped?/1) do
      @skipped_value
    else
      case length(attempt_results) do
        3 -> mean_of_3(attempt_results)
        5 -> average_of_5(attempt_results)
      end
      |> round_over_10_minutes()
    end
  end

  # See: https://www.worldcubeassociation.org/regulations/#9f2
  defp round_over_10_minutes(average) when average <= 10 * 6000, do: average
  defp round_over_10_minutes(average), do: round(average / 100) * 100

  defp average_of_5(attempt_results) when length(attempt_results) == 5 do
    [_, x, y, z, _] = Enum.sort_by(attempt_results, &to_monotonic/1)
    mean_of_3([x, y, z])
  end

  defp mean_of_3(attempt_results) when length(attempt_results) == 3 do
    if Enum.all?(attempt_results, &complete?/1) do
      mean(attempt_results)
    else
      @dnf_value
    end
  end

  defp mean([x, y, z]), do: round((x + y + z) / 3)

  @doc """
  Converts the given attempt result to a human-friendly string.
  """
  @spec format(attempt_result(), String.t()) :: String.t()
  def format(@skipped_value, _event_id), do: ""
  def format(@dnf_value, _event_id), do: "DNF"
  def format(@dns_value, _event_id), do: "DNS"

  def format(attempt_result, "333mbf") do
    %{solved: solved, attempted: attempted, centiseconds: centiseconds} =
      decode_mbld_attempt_result(attempt_result)

    clock_format = centiseconds_to_clock_format(centiseconds)
    short_clock_format = String.trim_trailing(clock_format, ".00")
    "#{solved}/#{attempted} #{short_clock_format}"
  end

  def format(attempt_result, "333fm") do
    # Note: FM singles are stored as the number of moves (e.g. 25),
    # while averages are stored with 2 decimal places (e.g. 2533 for an average of 25.33 moves).
    is_average? = attempt_result >= 1000

    if is_average? do
      to_string(attempt_result / 100)
    else
      to_string(attempt_result)
    end
  end

  def format(attempt_result, _event_id) do
    centiseconds_to_clock_format(attempt_result)
  end

  defp centiseconds_to_clock_format(centiseconds) do
    hours = centiseconds |> div(360_000)
    minutes = centiseconds |> rem(360_000) |> div(6_000)
    seconds = centiseconds |> rem(6_000) |> div(100)
    centis = centiseconds |> rem(100)

    full_formatted =
      "#{pad_zeros(hours)}:#{pad_zeros(minutes)}:#{pad_zeros(seconds)}.#{pad_zeros(centis)}"

    String.replace(full_formatted, ~r/^[0:]*(?!\.)/, "", global: true)
  end

  defp pad_zeros(n) do
    n |> to_string() |> String.pad_leading(2, "0")
  end

  # Returns an object representation of the given MBLD attempt result.
  defp decode_mbld_attempt_result(value) when value <= 0 do
    %{solved: 0, attempted: 0, centiseconds: value}
  end

  defp decode_mbld_attempt_result(value) do
    missed = rem(value, 100)
    seconds = value |> div(100) |> rem(100_000)
    points = 99 - (value |> div(10_000_000) |> rem(100))
    solved = points + missed
    attempted = solved + missed
    centiseconds = if seconds == 99_999, do: nil, else: seconds * 100

    %{solved: solved, attempted: attempted, centiseconds: centiseconds}
  end
end
