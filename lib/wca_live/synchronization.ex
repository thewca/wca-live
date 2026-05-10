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
  alias WcaLive.Wca
  alias WcaLive.Accounts
  alias WcaLive.Synchronization
  alias WcaLive.Competitions

  @doc """
  Fetches competition data from the WCA API for the given `wca_id`
  and imports it into the database.
  """
  @spec import_competition(String.t(), %Accounts.User{}) ::
          {:ok, %Competitions.Competition{}} | {:error, any()}
  def import_competition(wca_id, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.get_wcif(wca_id, access_token.access_token) do
      %Competitions.Competition{}
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
  """
  @spec synchronize_competition(%Competitions.Competition{}, %Accounts.User{}) ::
          {:ok, %Competitions.Competition{}} | {:error, any()}
  def synchronize_competition(competition, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.get_wcif(competition.wca_id, access_token.access_token),
         :ok <- ensure_no_external_results(competition, wcif),
         {:ok, updated_competition} <-
           Synchronization.Import.import_competition(competition, wcif),
         wcif <- Synchronization.Export.export_competition(updated_competition),
         {:ok, _} <- Wca.Api.patch_wcif(wcif, access_token.access_token) do
      {:ok, updated_competition}
    end
  end

  # Synchronization sends a PATCH back to the WCA API with the local
  # results. If a local round has no entered results, but the
  # corresponding WCIF round has results (entered externally), the
  # PATCH would overwrite them with empty results, which we want to
  # safeguard against. So in such case we fail, so the user can use
  # "Import results" first to bring those results into the local
  # database.
  defp ensure_no_external_results(competition, wcif) do
    competition = Repo.preload(competition, competition_events: [rounds: :results])

    case Synchronization.Import.rounds_missing_results(competition, wcif) do
      [] ->
        :ok

      rounds ->
        labels =
          rounds
          |> Enum.map(fn {round, competition_event, _wcif_round} ->
            "#{competition_event.event_id} round #{round.number}"
          end)
          |> Enum.join(", ")

        {:error,
         "the following rounds have results on the WCA website that are not in the local database: #{labels}." <>
           " Use \"Advanced > Import results\" to import them before synchronizing."}
    end
  end

  @doc """
  Imports results for competition rounds from the WCA API.

  Fetches the WCIF and for every local round with no entered results
  it builds and inserts new results based on the WCIF data.
  """
  @spec import_results(%Competitions.Competition{}, %Accounts.User{}) ::
          {:ok, %Competitions.Competition{}} | {:error, any()}
  def import_results(competition, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.get_wcif(competition.wca_id, access_token.access_token) do
      Synchronization.Import.import_results(competition, wcif, user)
    end
  end

  @doc """
  Returns a list of WCA competitions that the given user
  manages on the WCA website and which haven't been imported yet.
  """
  @spec get_importable_competition_briefs(%Accounts.User{}) ::
          {:ok, list(Synchronization.CompetitionBrief.t())} | {:error, any()}
  def get_importable_competition_briefs(user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, data} <-
           Wca.Api.get_upcoming_manageable_competitions(access_token.access_token) do
      competition_briefs =
        data
        |> Enum.filter(fn data -> data["announced_at"] != nil end)
        |> Enum.map(&Synchronization.CompetitionBrief.from_wca_json/1)

      wca_ids = Enum.map(competition_briefs, & &1.wca_id)

      imported_wca_ids =
        Repo.all(
          from c in Competitions.Competition, where: c.wca_id in ^wca_ids, select: c.wca_id
        )

      importable =
        Enum.filter(competition_briefs, fn competition ->
          competition.wca_id not in imported_wca_ids
        end)

      {:ok, importable}
    end
  end
end
