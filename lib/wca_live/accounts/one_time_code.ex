defmodule WcaLive.Accounts.OneTimeCode do
  @moduledoc """
  A short-lived code serving as an authentication strategy.

  The idea behind one-time code (OTC) is that a user generates
  it on a trusted device that they are already signed in on,
  then they can quickly enter that code on any other
  (potentially untrusted) device to establish a login session.
  This allows the user to effectively sign in on the other device
  without going through OAuth and typing any sensitive data.

  The primary target audience of this authentication strategy
  are scoretakers, as they may need to use third-party machines
  for entering results. Requiring them to use OAuth
  and type their WCA credentials on that machine
  is not perfect, so using OTC comes as a solution to that.
  """

  use WcaLive.Schema
  import Ecto.Changeset

  alias WcaLive.Accounts.{User, OneTimeCode}

  # Configure OTCs to expire in 2 minutes.
  @ttl_sec 2 * 60

  schema "one_time_codes" do
    field :code, :string
    field :expires_at, :utc_datetime

    belongs_to :user, User

    timestamps(updated_at: false)
  end

  @doc """
  Returns the changeset for a new OTC with randomly
  generated code and a short expiration time.
  """
  @spec new_for_user(%User{}) :: Ecto.Changeset.t()
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

  @doc """
  Returns `true` if `otc` is expired.
  """
  @spec expired?(%OneTimeCode{}) :: boolean()
  def expired?(otc) do
    DateTime.compare(DateTime.utc_now(), otc.expires_at) == :gt
  end
end
