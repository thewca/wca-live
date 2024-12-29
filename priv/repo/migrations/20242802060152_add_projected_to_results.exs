defmodule WcaLive.Repo.Migrations.AddProjectedToResults do
  use Ecto.Migration

  def change do
    alter table(:results) do
      add :projected, :integer, null: false
    end
  end
end