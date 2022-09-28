defmodule WcaLive.Repo.Migrations.CreateOneTimeCodes do
  use Ecto.Migration

  def change do
    create table(:one_time_codes) do
      add :code, :string
      add :expires_at, :utc_datetime
      add :user_id, references(:users, on_delete: :delete_all), null: false

      timestamps(updated_at: false)
    end

    create index(:one_time_codes, [:user_id])
    create unique_index(:one_time_codes, [:code])
  end
end
