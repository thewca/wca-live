defmodule WcaLive.Repo.Migrations.AddAdvancingQuestionableToResults do
  use Ecto.Migration

  def change do
    alter table(:results) do
      add :advancing_questionable, :boolean, null: false, default: false
    end
  end
end
