defmodule WcaLive.Repo.Migrations.CreateTerms do
  use Ecto.Migration

  def change do
    create table(:terms, primary_key: false) do
      add :key, :string, null: false, primary_key: true
      add :value, :binary, null: false
    end
  end
end
