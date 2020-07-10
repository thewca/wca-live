defmodule WcaLive.Repo.Migrations.CreatePeople do
  use Ecto.Migration

  def change do
    create table(:people) do
      add :registrant_id, :integer
      add :name, :string, null: false
      add :wca_user_id, :integer, null: false
      add :wca_id, :string
      add :country_iso2, :string, size: 2, null: false
      add :gender, :char, null: false
      add :birthdate, :date, null: false
      add :email, :string, null: false
      add :avatar_url, :string
      add :avatar_thumb_url, :string
      add :roles, {:array, :string}, null: false, default: []
      add :competition_id, references(:competitions, on_delete: :delete_all), null: false
    end

    create unique_index(:people, [:competition_id, :registrant_id])
  end
end
