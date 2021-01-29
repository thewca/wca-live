defmodule WcaLiveWeb.Endpoint do
  @moduledoc """
  This is the starting point for web interaction.

  See https://hexdocs.pm/phoenix/Phoenix.Endpoint.html for details.
  """

  use Phoenix.Endpoint, otp_app: :wca_live

  # Absinthe subscriptions integration with Phoenix.
  use Absinthe.Phoenix.Endpoint

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_wca_live_key",
    signing_salt: "YdSjF6+u"
  ]

  socket "/socket", WcaLiveWeb.UserSocket,
    websocket: true,
    longpoll: false

  socket "/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]]

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug Phoenix.CodeReloader
    plug Phoenix.Ecto.CheckRepoStatus, otp_app: :wca_live
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options

  plug CORSPlug

  plug WcaLiveWeb.Router
end
