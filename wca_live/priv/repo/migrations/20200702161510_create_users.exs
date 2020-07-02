defmodule WcaLive.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :wca_user_id, :integer, null: false
      add :wca_id, :string
      add :name, :string, null: false
      add :avatar_url, :string
      add :avatar_thumb_url, :string

      timestamps()
    end

    create unique_index(:users, [:wca_user_id])
  end
end
