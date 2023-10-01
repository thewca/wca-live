defmodule WcaLiveWeb.Helpers do
  def changeset_to_error_messages(changeset) do
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
