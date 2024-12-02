defmodule WcaLive.Repo.Migrations.AddCompetitionsEndDateIndex do
  use Ecto.Migration

  def change do
    create index(:competitions, [:end_date])
  end
end
