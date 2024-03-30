defmodule WcaLive.RecordsStub do
  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    Req.Test.json(
      conn,
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
      }
    )
  end
end
