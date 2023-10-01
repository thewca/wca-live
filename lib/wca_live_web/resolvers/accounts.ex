defmodule WcaLiveWeb.Resolvers.Accounts do
  alias WcaLive.Accounts

  def user_avatar(%{avatar_url: url, avatar_thumb_url: thumb_url}, _args, _resolution) do
    avatar = url && thumb_url && %{url: url, thumb_url: thumb_url}
    {:ok, avatar}
  end

  def current_user(_parent, _args, %{context: %{current_user: current_user}}) do
    {:ok, current_user}
  end

  def current_user(_parent, _args, _resolution), do: {:ok, nil}

  def active_scoretaking_tokens(_parent, _args, %{context: %{current_user: current_user}}) do
    {:ok, Accounts.list_active_scoretaking_tokens(current_user)}
  end

  def active_scoretaking_tokens(_parent, _args, _resolution), do: {:ok, []}

  def list_users(_parent, args, _resolution) do
    {:ok, Accounts.list_users(args)}
  end
end
