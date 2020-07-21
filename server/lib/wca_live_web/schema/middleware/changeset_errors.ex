defmodule WcaLiveWeb.Schema.Middleware.ChangesetErrors do
  @behaviour Absinthe.Middleware

  def call(resolution, _) do
    %{resolution |
      errors: Enum.flat_map(resolution.errors, &handle_error/1)
    }
  end

  defp handle_error(%Ecto.Changeset{} = changeset) do
    changeset
      |> Ecto.Changeset.traverse_errors(fn {message, opts} ->
        # Interpolate opts into message.
        Enum.reduce(opts, message, fn {key, value}, acc ->
          String.replace(acc, "%{#{key}}", to_string(value))
        end)
      end)
      |> Enum.flat_map(fn({field, messages}) ->
        Enum.map(messages, fn message ->
          "#{friendly_field_name(field)} #{message}"
        end)
      end)
  end

  defp handle_error(error), do: [error]

  defp friendly_field_name(field) do
    field
    |> to_string()
    |> String.replace("_", " ")
  end
end
