defmodule WcaLiveWeb.Resolvers.AccountsMutation do
  alias WcaLive.Accounts

  def generate_one_time_code(_parent, _args, %{context: %{current_user: current_user}}) do
    with {:ok, otc} <- Accounts.generate_one_time_code(current_user) do
      {:ok, %{one_time_code: otc}}
    end
  end

  def generate_one_time_code(_parent, _args, _resolution), do: {:error, "not authenticated"}
end
