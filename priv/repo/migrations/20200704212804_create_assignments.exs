defmodule WcaLive.Repo.Migrations.CreateAssignments do
  use Ecto.Migration

  def change do
    create table(:assignments) do
      add :assignment_code, :string, null: false
      add :station_number, :integer
      add :person_id, references(:people, on_delete: :delete_all), null: false
      add :activity_id, references(:activities, on_delete: :delete_all), null: false
    end

    create index(:assignments, [:activity_id])
    create index(:assignments, [:person_id])
  end
end
