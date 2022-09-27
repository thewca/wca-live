defmodule WcaLive.Wca.Api.InMemory do
  @moduledoc """
  A mock implementation of the WCA API returning predefined responses.

  Used for tests, so they don't depend on network requests to a real API.
  """

  @behaviour WcaLive.Wca.Api

  @impl true
  def get_me(_access_token), do: raise("not implemented")

  @impl true
  def get_wcif(_competition_wca_id, _access_token), do: raise("not implemented")

  @impl true
  def patch_wcif(_wcif, _access_token), do: raise("not implemented")

  @impl true
  def get_upcoming_manageable_competitions(_access_token), do: raise("not implemented")

  @impl true
  def get_records() do
    {:ok,
     %{
       "world_records" => %{
         "333" => %{
           "single" => 500,
           "average" => 600
         }
       },
       "continental_records" => %{
         "_Europe" => %{
           "333" => %{
             "single" => 600,
             "average" => 700
           }
         }
       },
       "national_records" => %{
         "United Kingdom" => %{
           "333" => %{
             "single" => 700,
             "average" => 800
           }
         }
       }
     }}
  end
end
