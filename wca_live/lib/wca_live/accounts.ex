defmodule WcaLive.Accounts do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Accounts.{User, AccessToken}
  alias WcaLive.Wca

  def import_user(user_attrs, access_token_attrs) do
    attrs = Map.put(user_attrs, :access_token, access_token_attrs)
    user = Repo.get_by(User, wca_user_id: user_attrs.wca_user_id) || %User{}

    user
    |> Repo.preload(:access_token)
    |> User.changeset(attrs)
    |> Ecto.Changeset.cast_assoc(:access_token)
    |> Repo.insert_or_update()
  end

  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  Gets user's access token and refreshes it if it's expired.
  """
  @spec get_valid_access_token(%User{}) :: {:ok, %AccessToken{}} | {:error, String.t()}
  def get_valid_access_token(user) do
    access_token = Ecto.assoc(user, :access_token) |> Repo.one!()
    plus_2_minutes = DateTime.utc_now() |> DateTime.add(2 * 60, :second)

    # Refresh the token if it expires in less than 2 minutes.
    if access_token.expires_at < plus_2_minutes do
      with {:ok, token_attrs} <- Wca.OAuth.refresh_token(access_token.refresh_token),
           {:ok, new_access_token} <- update_access_token(access_token, token_attrs) do
        {:ok, new_access_token}
      else
        {:error, _} ->
          {:error, "failed to refresh access token"}
      end
    else
      {:ok, access_token}
    end
  end

  defp update_access_token(access_token, attrs) do
    access_token
    |> AccessToken.changeset(attrs)
    |> Repo.update()
  end
end
