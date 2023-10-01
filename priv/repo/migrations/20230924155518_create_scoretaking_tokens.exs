defmodule WcaLive.Repo.Migrations.CreateScoretakingTokens do
  use Ecto.Migration

  def change do
    create table(:scoretaking_tokens) do
      add :token, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :competition_id, references(:competitions, on_delete: :delete_all), null: false

      timestamps(updated_at: false)
    end

    create index(:scoretaking_tokens, [:user_id])
    create index(:scoretaking_tokens, [:competition_id])
    create unique_index(:scoretaking_tokens, [:token])
  end
end
