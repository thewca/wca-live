defmodule WcaLiveWeb.PdfView do
  use WcaLiveWeb, :view

  alias WcaLive.Scoretaking.{Round, AttemptResult}
  alias WcaLive.Competitions.Person
  alias WcaLive.Wca

  def render("round.pdf", assigns) do
    # `render("round.html", assigns)` is generated at compile time from the .eex template.
    # Here we explicitly render it to a string and generate a PDF out of that.
    html = render_to_string(__MODULE__, "round.html", assigns)
    PdfGenerator.generate_binary!(html, shell_params: ["--orientation", "Landscape"])
  end
end
