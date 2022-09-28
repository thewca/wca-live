defmodule WcaLive.Wca.Api do
  @moduledoc """
  A behaviour module for implementing interaction with the WCA API.
  """

  @doc """
  Fetches the user related to the given access token.
  """
  @callback get_me(String.t()) :: {:ok, any()} | {:error, any()}

  @doc """
  Fetches WCIF for the given competition id.
  """
  @callback get_wcif(String.t(), String.t()) :: {:ok, any()} | {:error, any()}

  @doc """
  Saves the given WCIF.
  """
  @callback patch_wcif(any(), String.t()) :: {:ok, any()} | {:error, any()}

  @doc """
  Fetches upcoming competitions manageable by the authorized user.
  """
  @callback get_upcoming_manageable_competitions(String.t()) :: {:ok, any()} | {:error, any()}

  @doc """
  Fetches official regional records.
  """
  @callback get_records() :: {:ok, any()} | {:error, any()}

  @doc """
  Returns a module implementing this behaviour
  as configured for the current environment.

  Make sure to specify the module in configuration like this:

      config :wca_live, :wca_api, WcaLive.Wca.Api.Http
  """
  def impl() do
    Application.fetch_env!(:wca_live, :wca_api)
  end
end
