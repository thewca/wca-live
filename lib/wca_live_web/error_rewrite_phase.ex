defmodule WcaLiveWeb.ErrorRewritePhase do
  def run(blueprint, _options) do
    invalid_graphql? = blueprint.execution.validation_errors != []

    blueprint =
      if invalid_graphql? do
        update_in(blueprint.result.errors, fn errors ->
          Enum.map(errors, fn error ->
            # There were several cases where the client side was cached
            # (could be a result of the old service worker not being
            # deactivated). In those cases hard refresh did the job, so
            # whenever we get a request that does not match current
            # schema, we add this pointer to the error message.
            update_in(
              error.message,
              &("Please hard refresh the page with ctrl + shift + r (or cmd + shift + r)" <>
                  " to make sure you are running the latest version of the website. Error: " <> &1)
            )
          end)
        end)
      else
        blueprint
      end

    {:ok, blueprint}
  end
end
