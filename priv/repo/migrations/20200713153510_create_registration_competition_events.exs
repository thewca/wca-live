defmodule WcaLive.Repo.Migrations.CreateRegistrationCompetitionEvents do
  use Ecto.Migration

  def change do
    create table(:registration_competition_events, primary_key: false) do
      add :registration_id, references(:registrations, on_delete: :delete_all), null: false

      add :competition_event_id, references(:competition_events, on_delete: :delete_all),
        null: false
    end

    create index(:registration_competition_events, [:competition_event_id])

    create unique_index(:registration_competition_events, [
             :registration_id,
             :competition_event_id
           ])
  end
end
