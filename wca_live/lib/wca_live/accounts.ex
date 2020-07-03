defmodule WcaLive.Accounts do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Accounts.{User, AccessToken}

  def import_user(user_attrs, access_token_attrs) do
    Repo.get_by(User, wca_user_id: user_attrs.wca_user_id)
    |> Repo.preload(:access_token)
    |> case do
      nil ->
        %User{}
        |> User.changeset(user_attrs)
        |> Ecto.Changeset.put_assoc(
          :access_token,
          AccessToken.changeset(%AccessToken{}, access_token_attrs)
        )
        |> Repo.insert()

      user ->
        user
        |> User.changeset(user_attrs)
        |> Ecto.Changeset.put_assoc(
          :access_token,
          AccessToken.changeset(user.access_token, access_token_attrs)
        )
        |> Repo.update()
    end
  end

  def get_user!(id), do: Repo.get!(User, id)
end
