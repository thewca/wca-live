defmodule WcaLive.Repo.Migrations.CreateRounds do
  use Ecto.Migration

  def change do
    create table(:rounds) do
      add :number, :integer, null: false
      add :format_id, :char, null: false
      add :time_limit, :map
      add :cutoff, :map
      add :advancement_condition, :map
      add :scramble_set_count, :integer, null: false

      add :competition_event_id, references(:competition_events, on_delete: :delete_all),
        null: false
    end

    create unique_index(:rounds, [:competition_event_id, :number])
  end
end
