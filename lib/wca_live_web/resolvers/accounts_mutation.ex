defmodule WcaLiveWeb.Resolvers.AccountsMutation do
  alias WcaLive.Accounts

  def generate_one_time_code(_parent, _args, %{context: %{current_user: current_user}}) do
    with {:ok, otc} <- Accounts.generate_one_time_code(current_user) do
      {:ok, %{one_time_code: otc}}
    end
  end

  def generate_one_time_code(_parent, _args, _resolution), do: {:error, "not authenticated"}

  def sign_in(_parent, %{input: input}, _resolution) do
    with {:ok, user} <- Accounts.authenticate_by_code(input.code) do
      token = WcaLiveWeb.Auth.generate_token(user.id)

      {:ok,
       %{
         token: token,
         user: user
       }}
    end
  end
end
