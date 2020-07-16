defmodule WcaLive.Synchronization do
  import Ecto.Query, warn: false
  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.{Wca, Accounts, Synchronization}
  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.Competition
  alias WcaLive.Synchronization.CompetitionBrief

  def import_competition(wca_id, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.get_wcif(wca_id, access_token.access_token) do
      %Competition{}
      |> Changeset.change()
      |> Changeset.put_assoc(:imported_by, user)
      |> Synchronization.Import.import_competition(wcif)
    end
  end

  def synchronize_competition(competition) do
    # Use oauth credentials of whoever imported the competition to do synchronization,
    # because plain scoretakers don't have permissions to save WCIF to the WCA website,
    # yet we still want them to be able to synchronize results.
    imported_by = competition |> Ecto.assoc(:imported_by) |> Repo.one!()

    with {:ok, access_token} <- Accounts.get_valid_access_token(imported_by),
         {:ok, wcif} <- Wca.Api.get_wcif(competition.wca_id, access_token.access_token),
         {:ok, updated_competition} <- Synchronization.Import.import_competition(competition, wcif),
         wcif <- Synchronization.Export.export_competition(updated_competition),
         {:ok, _} <- Wca.Api.patch_wcif(wcif, access_token.access_token) do
      {:ok, updated_competition}
    end
  end

  @spec get_importable_competition_briefs(%User{}) :: list(CompetitionBrief.t())
  def get_importable_competition_briefs(user) do
    user = user |> Repo.preload(:access_token)
    {:ok, data} = Wca.Api.get_upcoming_manageable_competitions(user.access_token.access_token)

    competition_briefs =
      data
      |> Enum.filter(fn data -> data["announced_at"] != nil end)
      |> Enum.map(&CompetitionBrief.from_wca_json/1)

    wca_ids = Enum.map(competition_briefs, & &1.wca_id)

    imported_wca_ids =
      Repo.all(from c in Competition, where: c.wca_id in ^wca_ids, select: c.wca_id)

    Enum.filter(competition_briefs, fn competition ->
      competition.wca_id not in imported_wca_ids
    end)
  end
end
