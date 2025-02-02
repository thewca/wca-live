defmodule WcaLive.Accounts do
  @moduledoc """
  Context for account management.
  """

  import Ecto.Query, warn: false

  alias WcaLive.Repo
  alias WcaLive.Accounts
  alias WcaLive.Accounts.User
  alias WcaLive.Wca

  @doc """
  Saves the given user and OAuth access token attributes into the database.

  If there's a user with matching `wca_user_id`, it gets updated.
  Otherwise a new user is created.
  """
  @spec import_user(map(), map()) :: {:ok, %User{}} | {:error, Ecto.Changeset.t()}
  def import_user(user_attrs, access_token_attrs) do
    attrs = Map.put(user_attrs, :access_token, access_token_attrs)
    user = Repo.get_by(User, wca_user_id: user_attrs.wca_user_id) || %User{}

    user
    |> Repo.preload(:access_token)
    |> User.changeset(attrs)
    |> Ecto.Changeset.cast_assoc(:access_token)
    |> Repo.insert_or_update()
  end

  @doc """
  Gets a single user.
  """
  @spec get_user(term()) :: %User{} | nil
  def get_user(id), do: Repo.get(User, id)

  @doc """
  Returns a list of users.

  Takes a map with the following optional arguments:

    * `:limit` - The maximum number of users to return.
    * `:filter` - A query string to filter the results by.
  """
  @spec list_users(map()) :: list(%User{})
  def list_users(args \\ %{}) do
    limit = args[:limit] || 10

    User
    |> filter_by_text(args[:filter])
    |> limit(^limit)
    |> Repo.all()
  end

  defp filter_by_text(query, nil), do: query

  defp filter_by_text(query, filter) do
    from u in query, where: ilike(u.name, ^"#{filter}%")
  end

  @doc """
  Generates a session token.
  """
  def generate_user_session_token(user) do
    user_token = Accounts.UserToken.build_session_token(user)
    Repo.insert!(user_token)
    user_token.token
  end

  @doc """
  Gets the user with the given token.
  """
  def get_user_by_session_token(token) do
    Repo.one(Accounts.UserToken.verify_session_token_query(token))
  end

  @doc """
  Deletes session token by value.
  """
  def delete_user_session_token(token) do
    Repo.delete_all(Accounts.UserToken.token_and_context_query(token, "session"))
    :ok
  end

  @doc """
  Gets user's access token and refreshes it if it's expired.
  """
  @spec get_valid_access_token(%User{}) :: {:ok, %Accounts.AccessToken{}} | {:error, String.t()}
  def get_valid_access_token(user) do
    access_token = Ecto.assoc(user, :access_token) |> Repo.one!()

    # Refresh the token if it expires soon.
    if Accounts.AccessToken.expires_soon?(access_token) do
      with {:ok, token_attrs} <- Wca.OAuth.refresh_token(access_token.refresh_token),
           {:ok, new_access_token} <- update_access_token(access_token, token_attrs) do
        {:ok, new_access_token}
      else
        {:error, _} ->
          {:error, "failed to refresh access token, please try to sign out and in"}
      end
    else
      {:ok, access_token}
    end
  end

  defp update_access_token(access_token, attrs) do
    access_token
    |> Accounts.AccessToken.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Creates a new one-time code for the given user.

  If the user already has an OTC, it gets removed.
  """
  @spec generate_one_time_code(%User{}) ::
          {:ok, %Accounts.OneTimeCode{}} | {:error, Ecto.Changeset.t()}
  def generate_one_time_code(user) do
    otc = Accounts.OneTimeCode.new_for_user(user)

    user
    |> Repo.preload(:one_time_code)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:one_time_code, otc)
    |> Repo.update()
    |> case do
      {:ok, user} -> {:ok, user.one_time_code}
      {:error, _} = error -> error
    end
  end

  @doc """
  Finds user for the given one-time code, unless it's expired.

  The code is removed from the database.
  """
  @spec authenticate_by_code(String.t()) :: {:ok, %User{}} | {:error, String.t()}
  def authenticate_by_code(code) do
    Accounts.OneTimeCode
    |> Repo.get_by(code: code)
    |> case do
      nil ->
        {:error, "invalid code"}

      otc ->
        if Accounts.OneTimeCode.expired?(otc) do
          {:error, "code expired"}
        else
          user = Ecto.assoc(otc, :user) |> Repo.one!()
          # Delete the one time code as it's been used.
          Repo.delete!(otc)
          {:ok, user}
        end
    end
  end

  @doc """
  Generates a new scoretaking token.
  """
  def generate_scoretaking_token(user, competition) do
    scoretaking_token = Accounts.ScoretakingToken.build_scoretaking_token(user, competition)
    Repo.insert!(scoretaking_token)
  end

  @doc """
  Gets the user with the given token.
  """
  def get_user_and_competition_by_scoretaking_token(token) do
    Repo.one(Accounts.ScoretakingToken.verify_token_query(token))
  end

  @doc """
  Gets scoretaking token by id.
  """
  def get_scoretaking_token!(id) do
    Repo.get!(Accounts.ScoretakingToken, id)
  end

  @doc """
  Deletes scoretaking token.
  """
  def delete_scoretaking_token(scoretaking_token) do
    Repo.delete!(scoretaking_token)
    :ok
  end

  @doc """
  Lists all active scoretaking tokens for the given user.
  """
  def list_active_scoretaking_tokens(user) do
    Repo.all(Accounts.ScoretakingToken.active_tokens_for_user_query(user))
  end
end
