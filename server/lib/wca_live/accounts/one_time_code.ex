defmodule WcaLive.Accounts.OneTimeCode do
  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.{User, OneTimeCode}

  @required_fields [:code, :expires_at]
  @optional_fields []
  # 2 minutes
  @ttl_sec 2 * 60

  schema "one_time_codes" do
    field :code, :string
    field :expires_at, :utc_datetime

    belongs_to :user, User

    timestamps(updated_at: false)
  end

  @doc false
  def changeset(otc, attrs) do
    otc
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end

  def new_for_user(user) do
    code = "#{user.id}-#{random_digits(6)}"

    expires_at =
      DateTime.utc_now() |> DateTime.truncate(:second) |> DateTime.add(@ttl_sec, :second)

    %OneTimeCode{}
    |> change(
      code: code,
      expires_at: expires_at
    )
  end

  defp random_digits(size) do
    1..size
    |> Enum.map(fn _ -> random_digit() end)
    |> Enum.join()
  end

  defp random_digit() do
    digits = ~w(0 1 2 3 4 5 6 7 8 9)
    Enum.random(digits)
  end

  def expired?(otc) do
    DateTime.compare(DateTime.utc_now(), otc.expires_at) == :gt
  end
end
