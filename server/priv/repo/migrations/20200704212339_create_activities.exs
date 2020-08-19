defmodule WcaLive.Repo.Migrations.CreateActivities do
  use Ecto.Migration

  def change do
    create table(:activities) do
      add :wcif_id, :integer, null: false
      add :name, :string, null: false
      add :activity_code, :string, null: false
      add :start_time, :utc_datetime, null: false
      add :end_time, :utc_datetime, null: false
      add :room_id, references(:rooms, on_delete: :delete_all)
      add :parent_activity_id, references(:activities, on_delete: :delete_all)
      add :round_id, references(:rounds, on_delete: :nilify_all)
    end

    create index(:activities, [:room_id])
    create index(:activities, [:parent_activity_id])
    create index(:activities, [:round_id])
  end
end
