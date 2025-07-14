import { useCallback } from "react";
import { useSnackbar } from "notistack";
import { apolloErrorToMessage } from "../lib/errors";

/**
 * Returns a callback that takes an Apollo error and enqueues an appropriate error snackbar.
 *
 * @example
 * const errorHandler = useApolloErrorHandler();
 * const [update] = useMutation(UPDATE_MUTATION, { onError: errorHandler });
 */
export default function useApolloErrorHandler() {
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    (error) => {
      const message = apolloErrorToMessage(error);
      enqueueSnackbar(message, { variant: "error" });
    },
    [enqueueSnackbar],
  );
}
