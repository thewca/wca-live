import { formatSentence } from "./utils";

export function apolloErrorToMessage(error) {
  if (error && error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors
      .map((error) => error.message)
      .map(formatSentence)
      .join(" ");
  } else {
    return "Something went wrong.";
  }
}
