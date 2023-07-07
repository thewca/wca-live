defmodule WcaLiveWeb.PdfHTML do
  use WcaLiveWeb, :html

  alias WcaLive.Scoretaking.{Round, AttemptResult}
  alias WcaLive.Competitions.Person
  alias WcaLive.Wca

  embed_templates "pdf_html/*"
end
