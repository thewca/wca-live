defmodule WcaLive.Repo.Migrations.ChangeResultsReferences do
  use Ecto.Migration

  def change do
    alter table(:results) do
      modify :person_id, references(:people, on_delete: :delete_all),
        from: references(:people, on_delete: :nothing)
    end
  end
end
