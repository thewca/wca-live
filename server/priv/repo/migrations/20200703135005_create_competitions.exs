defmodule WcaLive.Repo.Migrations.CreateCompetitions do
  use Ecto.Migration

  def change do
    create table(:competitions) do
      add :wca_id, :string, null: false
      add :name, :string, null: false
      add :short_name, :string, null: false
      add :start_date, :date, null: false
      add :end_date, :date, null: false
      add :start_time, :utc_datetime, null: false
      add :end_time, :utc_datetime, null: false
      add :competitor_limit, :integer
      add :synchronized_at, :utc_datetime, null: false
      add :imported_by_id, references(:users, on_delete: :nothing), null: false

      timestamps()
    end

    create index(:competitions, [:imported_by_id])
    create unique_index(:competitions, [:wca_id])
    create index(:competitions, [:start_date])
  end
end
