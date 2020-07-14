defmodule WcaLive.Repo.Migrations.CreateStaffMembers do
  use Ecto.Migration

  def change do
    create table(:staff_members) do
      add :roles, {:array, :string}, null: false, default: []
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :competition_id, references(:competitions, on_delete: :delete_all), null: false
    end

    create index(:staff_members, [:user_id])
    create unique_index(:staff_members, [:competition_id, :user_id])
  end
end
