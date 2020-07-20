defmodule WcaLive.Scoretaking.AttemptResult do
  @skipped_value 0
  @dnf_value -1
  # @dns_value -2

  def better?(attempt_result1, attempt_result2) do
    to_monotonic(attempt_result1) <= to_monotonic(attempt_result2)
  end

  def to_monotonic(attempt_result) do
    if complete?(attempt_result) do
      attempt_result
    else
      # Note: in Elixir every number is lower than any given atom.
      :incomplete
    end
  end

  def complete?(attempt_result), do: attempt_result > 0

  def skipped?(attempt_result), do: attempt_result == @skipped_value

  def pad_skipped(attempt_results, number_of_attempts)
      when length(attempt_results) > number_of_attempts do
    Enum.take(attempt_results, number_of_attempts)
  end

  def pad_skipped(attempt_results, number_of_attempts) do
    missing = number_of_attempts - length(attempt_results)
    attempt_results ++ List.duplicate(@skipped_value, missing)
  end

  def best(attempt_results) do
    non_skipped = Enum.reject(attempt_results, &skipped?/1)
    complete = Enum.filter(attempt_results, &complete?/1)

    cond do
      Enum.empty?(non_skipped) -> @skipped_value
      not Enum.empty?(complete) -> Enum.min(complete)
      true -> Enum.max(non_skipped)
    end
  end

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
end
