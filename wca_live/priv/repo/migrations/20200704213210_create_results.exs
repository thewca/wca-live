defmodule WcaLive.Repo.Migrations.CreateResults do
  use Ecto.Migration

  def change do
    create table(:results) do
      add :ranking, :integer
      add :attempts, {:array, :map}, null: false
      add :best, :integer
      add :average, :integer
      add :single_record_tag, :string
      add :average_record_tag, :string
      add :person_id, references(:people, on_delete: :restrict), null: false
      add :round_id, references(:rounds, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:results, [:person_id])
    create unique_index(:results, [:round_id, :person_id])
  end
end
