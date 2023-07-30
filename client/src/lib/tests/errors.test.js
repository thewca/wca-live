import { apolloErrorToMessage } from "../errors";

describe("apolloErrorToMessage", () => {
  test("returns a default message if the given error is null", () => {
    expect(apolloErrorToMessage(null)).toEqual("Something went wrong.");
  });

  test("returns a default message if there are no GraphQL errors", () => {
    const error = { graphQLErrors: [] };
    expect(apolloErrorToMessage(error)).toEqual("Something went wrong.");
  });

  test("returns the GraphQL error if there is one, transforming it into a sentence", () => {
    const error = { graphQLErrors: [{ message: "there is no more tea" }] };
    expect(apolloErrorToMessage(error)).toEqual("There is no more tea.");
  });

  test("returns all the GraphQL errors if there are many, transforming them into a sentence", () => {
    const error = {
      graphQLErrors: [
        { message: "there is no more tea" },
        { message: "the value is invalid" },
      ],
    };
    expect(apolloErrorToMessage(error)).toEqual(
      "There is no more tea. The value is invalid."
    );
  });
});
