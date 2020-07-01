defmodule WcaLive.Repo do
  use Ecto.Repo,
    otp_app: :wca_live,
    adapter: Ecto.Adapters.Postgres
end
