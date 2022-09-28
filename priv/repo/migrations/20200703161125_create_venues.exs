defmodule WcaLive.Repo.Migrations.CreateVenues do
  use Ecto.Migration

  def change do
    create table(:venues) do
      add :wcif_id, :integer, null: false
      add :name, :string, null: false
      add :latitude_microdegrees, :integer, null: false
      add :longitude_microdegrees, :integer, null: false
      add :country_iso2, :string, size: 2, null: false
      add :timezone, :string, null: false
      add :competition_id, references(:competitions, on_delete: :delete_all), null: false
    end

    create unique_index(:venues, [:competition_id, :wcif_id])
  end
end
