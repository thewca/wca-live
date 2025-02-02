defmodule WcaLive.AccountsTest do
  use WcaLive.DataCase, async: true
  import WcaLive.Factory

  alias WcaLive.Accounts
  alias WcaLive.Accounts.User
  alias WcaLive.Accounts.OneTimeCode

  test "import_user/1 creates a user if the wca user id is new" do
    user_attrs = params_for(:user)
    access_token_attrs = params_for(:access_token)

    assert {:ok, %User{} = user} = Accounts.import_user(user_attrs, access_token_attrs)

    assert user.name == user_attrs.name
  end

  test "import_user/1 updates an existing user if the wca user id exists" do
    existing_user = insert(:user, wca_user_id: 1, name: "Current Name")

    user_attrs = params_for(:user, wca_user_id: 1, name: "New Name")
    access_token_attrs = params_for(:access_token)

    assert {:ok, %User{} = user} = Accounts.import_user(user_attrs, access_token_attrs)

    assert user.id == existing_user.id
    assert user.name == "New Name"
  end

  test "get_user/1 returns user with the given id" do
    user = insert(:user)

    assert user == Accounts.get_user(user.id)
  end

  test "list_users/1 given no args returns the default number of users" do
    users = insert_list(5, :user)

    assert Enum.sort(users) == Enum.sort(Accounts.list_users())
  end

  test "list_users/1 given :limit returns the specified subset of users" do
    insert_list(5, :user)

    list = Accounts.list_users(%{limit: 2})

    assert 2 == length(list)
  end

  test "list_users/1 given :filter returns users with matching name" do
    sherlock = insert(:user, name: "Sherlock Holmes")
    john = insert(:user, name: "John Watson")
    shaq = insert(:user, name: "Shaquille O'Neal")

    list = Accounts.list_users(%{filter: "sh"})

    assert sherlock in list
    assert john not in list
    assert shaq in list
  end

  test "generate_one_time_code/1 generates a new otc for the given user" do
    user = insert(:user)

    assert {:ok, %OneTimeCode{}} = Accounts.generate_one_time_code(user)
  end

  test "generate_one_time_code/1 removes existing otc if the given user has one" do
    user = insert(:user)
    otc = insert(:one_time_code, user: user)

    assert {:ok, %OneTimeCode{}} = Accounts.generate_one_time_code(user)
    assert nil == WcaLive.Repo.get(OneTimeCode, otc.id)
  end

  test "authenticate_by_code/1 given non-existet code returns an error" do
    assert {:error, "invalid code"} == Accounts.authenticate_by_code("invalid")
  end

  test "authenticate_by_code/1 given an expired code returns an error" do
    hour_ago = DateTime.utc_now() |> DateTime.add(-3600, :second)
    otc = insert(:one_time_code, expires_at: hour_ago)

    assert {:error, "code expired"} == Accounts.authenticate_by_code(otc.code)
  end

  test "authenticate_by_code/1 given a valid code removes it from database and returns the corresponding user" do
    otc = insert(:one_time_code)

    assert {:ok, otc.user} == Accounts.authenticate_by_code(otc.code)
    assert nil == WcaLive.Repo.get(OneTimeCode, otc.id)
  end
end
