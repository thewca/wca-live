defmodule WcaLiveWeb.Schema.Middleware.HandleErrors do
  @moduledoc """
  A middleware transforming various error types
  into readable strings.
  """

  @behaviour Absinthe.Middleware

  @impl true
  def call(resolution, _) do
    %{resolution | errors: Enum.flat_map(resolution.errors, &handle_error/1)}
  end

  defp handle_error(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {message, opts} ->
      # Interpolate opts into message.
      Enum.reduce(opts, message, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
    |> Enum.flat_map(fn {field, messages} ->
      format_field_error_messages(field, messages)
    end)
  end

  defp handle_error(%Ecto.Query{} = query) do
    %{from: %{source: {_, queryable}}} = query
    schema = queryable |> Module.split() |> List.last()
    ["#{String.downcase(schema)} not found"]
  end

  defp handle_error(error), do: [error]

  defp format_field_error_messages(field, messages) do
    Enum.flat_map(messages, fn message ->
      format_field_error_message(field, message)
    end)
  end

  defp format_field_error_message(field, message) when is_binary(message) do
    ["#{friendly_field_name(field)} #{message}"]
  end

  defp format_field_error_message(_field, %{} = message) do
    # Errors may come from nested associated structures,
    # so a message could be a map
    Enum.flat_map(message, fn {field, messages} ->
      format_field_error_messages(field, messages)
    end)
  end

  defp friendly_field_name(field) do
    field
    |> to_string()
    |> String.replace("_", " ")
  end
end
