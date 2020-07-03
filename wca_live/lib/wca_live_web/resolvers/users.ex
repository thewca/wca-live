defmodule WcaLiveWeb.Resolvers.Users do
  def current_user(_parent, _args, %{context: %{current_user: current_user}}) do
    {:ok, current_user}
  end

  def current_user(_parent, _args, _resolution), do: {:ok, nil}

  def user_avatar(%{avatar_url: url, avatar_thumb_url: thumb_url}, _args, _resolution) do
    {:ok, %{url: url, thumb_url: thumb_url}}
  end
end
