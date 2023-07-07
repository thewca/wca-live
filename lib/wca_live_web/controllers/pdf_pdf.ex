defmodule WcaLiveWeb.PdfPDF do
  def render("round.pdf", assigns) do
    html =
      WcaLiveWeb.PdfHTML.round(assigns)
      |> Phoenix.HTML.Safe.to_iodata()
      |> IO.iodata_to_binary()

    PdfGenerator.generate_binary!(html, shell_params: ["--orientation", "Landscape"])
  end
end
