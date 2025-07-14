defmodule WcaLiveWeb.PdfHTML do
  use WcaLiveWeb, :html

  alias WcaLive.Scoretaking
  alias WcaLive.Competitions
  alias WcaLive.Wca

  embed_templates "pdf_html/*"
end
