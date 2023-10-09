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

  def handle_error(%Ecto.Changeset{} = changeset) do
    WcaLiveWeb.Helpers.changeset_to_error_messages(changeset)
  end

  def handle_error(%Ecto.Query{} = query) do
    %{from: %{source: {_, queryable}}} = query
    schema = queryable |> Module.split() |> List.last()
    ["#{String.downcase(schema)} not found"]
  end

  def handle_error(error), do: [error]
end
