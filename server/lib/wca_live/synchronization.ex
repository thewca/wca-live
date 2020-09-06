defmodule WcaLive.Synchronization do
  @moduledoc """
  Context for synchronizing competitions with the WCA website.

  Every competition is initially imported from the WCA API
  into the local database. The WCA database is considered
  to be the source of truth, so whenever there are relevant
  changes to the competition (either here or in the WCA database)
  the competition may be synchronized to get the updated data
  and also save any local changes back to the WCA API.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset
  alias WcaLive.Repo
  alias WcaLive.{Wca, Accounts, Synchronization}
  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.Competition
  alias WcaLive.Synchronization.CompetitionBrief

  @doc """
  Fetches competition data from the WCA API for the given `wca_id`
  and imports it into the database.
  """
  @spec import_competition(String.t(), %User{}) :: {:ok, %Competition{}} | {:error, any()}
  def import_competition(wca_id, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.impl().get_wcif(wca_id, access_token.access_token) do
      %Competition{}
      |> Changeset.change()
      |> Changeset.put_assoc(:imported_by, user)
      |> Synchronization.Import.import_competition(wcif)
    end
  end

  @doc """
  Synchronized competition data in the local database with the WCA database.

  Synchronization consists of the following steps:

    * New competition data is fetched from the WCA API.
    * Relevant changes are saved to the local database (either by overriding or merging).
    * The updated data is sent back to the WCA API,
      to inform it of local changes, such as results.

  The final goal is for the local database and the WCA database
  to reflect the same state, so that other applications
  may load the latest data from the WCA API.

  Uses OAuth access token of whoever imported the competition.
  """
  @spec synchronize_competition(%Competition{}) :: {:ok, %Competition{}} | {:error, any()}
  def synchronize_competition(competition) do
    # Use oauth credentials of whoever imported the competition to do synchronization,
    # because plain scoretakers don't have permissions to save WCIF to the WCA website,
    # yet we still want them to be able to synchronize results.
    imported_by = competition |> Ecto.assoc(:imported_by) |> Repo.one!()

    with {:ok, access_token} <- Accounts.get_valid_access_token(imported_by),
         {:ok, wcif} <- Wca.Api.impl().get_wcif(competition.wca_id, access_token.access_token),
         {:ok, updated_competition} <-
           Synchronization.Import.import_competition(competition, wcif),
         wcif <- Synchronization.Export.export_competition(updated_competition),
         {:ok, _} <- Wca.Api.impl().patch_wcif(wcif, access_token.access_token) do
      {:ok, updated_competition}
    end
  end

  @doc """
  Returns a list of WCA competitions that the given user
  manages on the WCA website and which haven't been imported yet.
  """
  @spec get_importable_competition_briefs(%User{}) ::
          {:ok, list(CompetitionBrief.t())} | {:error, any()}
  def get_importable_competition_briefs(user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, data} <-
           Wca.Api.impl().get_upcoming_manageable_competitions(access_token.access_token) do
      competition_briefs =
        data
        |> Enum.filter(fn data -> data["announced_at"] != nil end)
        |> Enum.map(&CompetitionBrief.from_wca_json/1)

      wca_ids = Enum.map(competition_briefs, & &1.wca_id)

      imported_wca_ids =
        Repo.all(from c in Competition, where: c.wca_id in ^wca_ids, select: c.wca_id)

      importable =
        Enum.filter(competition_briefs, fn competition ->
          competition.wca_id not in imported_wca_ids
        end)

      {:ok, importable}
    end
  end
end
