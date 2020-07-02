defmodule WcaLive.Schema do
  @moduledoc """
  Defines a schema.

  Decorates Ecto.Schema with configuration overrides.

  ## Example

      defmodule User do
        use WcaLive.Schema

        schema "users" do
          # ...
        end
      end
  """

  defmacro __using__(_) do
    quote do
      use Ecto.Schema
      # Use UTC timestamps.
      @timestamps_opts [type: :utc_datetime]
    end
  end
end
