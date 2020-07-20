defmodule WcaLive.Repo.Migrations.CreateCompetitionEvents do
  use Ecto.Migration

  def change do
    create table(:competition_events) do
      add :competitor_limit, :integer
      add :qualification, :map
      add :event_id, :string, size: 6, null: false
      add :competition_id, references(:competitions, on_delete: :delete_all), null: false
    end

    create unique_index(:competition_events, [:competition_id, :event_id])
  end
end
