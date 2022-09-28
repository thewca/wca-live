defmodule WcaLive.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :wcif_id, :integer, null: false
      add :name, :string, null: false
      add :color, :string, null: false
      add :venue_id, references(:venues, on_delete: :delete_all), null: false
    end

    create index(:rooms, [:venue_id])
  end
end
