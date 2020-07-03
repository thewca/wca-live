defmodule WcaLive.Accounts do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Accounts.User

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
end
