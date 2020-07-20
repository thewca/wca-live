defmodule WcaLive.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :wca_user_id, :integer, null: false
      add :name, :string, null: false
      add :wca_id, :string
      add :country_iso2, :string, size: 2
      add :avatar_url, :string
      add :avatar_thumb_url, :string
      add :wca_teams, {:array, :string}, null: false, default: []

      timestamps()
    end

    create unique_index(:users, [:wca_user_id])
  end
end
