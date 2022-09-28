defmodule WcaLive.Repo.Migrations.CreateResults do
  use Ecto.Migration

  def change do
    create table(:results) do
      add :ranking, :integer
      add :attempts, {:array, :map}, null: false, default: []
      add :best, :integer, null: false
      add :average, :integer, null: false
      add :single_record_tag, :string
      add :average_record_tag, :string
      add :advancing, :boolean, null: false, default: false
      add :person_id, references(:people, on_delete: :nothing), null: false
      add :round_id, references(:rounds, on_delete: :delete_all), null: false
      add :entered_by_id, references(:users, on_delete: :nothing)
      add :entered_at, :utc_datetime

      timestamps()
    end

    create unique_index(:results, [:person_id, :round_id])
    create index(:results, [:round_id, :ranking])
    create index(:results, [:single_record_tag])
    create index(:results, [:average_record_tag])
  end
end
