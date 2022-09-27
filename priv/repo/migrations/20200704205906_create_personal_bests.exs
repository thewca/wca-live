defmodule WcaLive.Repo.Migrations.CreatePersonalBests do
  use Ecto.Migration

  def change do
    create table(:personal_bests) do
      add :best, :integer, null: false
      add :type, :string, null: false
      add :world_ranking, :integer, null: false
      add :continental_ranking, :integer, null: false
      add :national_ranking, :integer, null: false
      add :event_id, :string, size: 6, null: false
      add :person_id, references(:people, on_delete: :delete_all), null: false
    end

    create unique_index(:personal_bests, [:person_id, :event_id, :type])
  end
end
