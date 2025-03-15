import { formatCutoff, formatTimeLimit } from "../formatters";

describe("formatCutoff", () => {
  test("returns None if there is no cutoff", () => {
    const cutoff = null;
    expect(formatCutoff(cutoff, "333mbf")).toEqual("None");
  });

  test("returns points for MBLD", () => {
    const cutoff = { numberOfAttempts: 1, attemptResult: 910000000 };
    expect(formatCutoff(cutoff, "333mbf")).toEqual("8 points");
  });

  test("returns moves for FMC", () => {
    const cutoff = { numberOfAttempts: 1, attemptResult: 40 };
    expect(formatCutoff(cutoff, "333fm")).toEqual("40 moves");
  });

  test("returns clock format for ordinary events", () => {
    const cutoff = { numberOfAttempts: 2, attemptResult: 1.5 * 3600 * 100 };
    expect(formatCutoff(cutoff, "333")).toEqual("1:30:00.00");
  });

  test("strips leading zeros", () => {
    const cutoff = { numberOfAttempts: 2, attemptResult: 30 * 100 };
    expect(formatCutoff(cutoff, "333")).toEqual("30.00");
  });
});

describe("formatTimeLimit", () => {
  test("returns Regulated for events with predefined time limit", () => {
    const timeLimit = null;
    expect(formatTimeLimit(timeLimit, "333mbf")).toEqual("Regulated");
    expect(formatTimeLimit(timeLimit, "333fm")).toEqual("Regulated");
  });

  test("returns just the time for non-cumulative limit", () => {
    const timeLimit = { centiseconds: 15 * 100, cumulativeRoundWcifIds: [] };
    expect(formatTimeLimit(timeLimit, "333")).toEqual("15.00");
  });

  test("makes it clear that a limit is cumulative for all sovles", () => {
    const timeLimit = {
      centiseconds: 60 * 100,
      cumulativeRoundWcifIds: ["333bf-r1"],
    };
    expect(formatTimeLimit(timeLimit, "333bf")).toEqual("1:00.00 in total");
  });

  test("includes list of round ids for multi-round cumulative limit", () => {
    const timeLimit = {
      centiseconds: 1.5 * 3600 * 100,
      cumulativeRoundWcifIds: ["444bf-r1", "555bf-r1"],
    };
    expect(formatTimeLimit(timeLimit, "444bf")).toEqual(
      "1:30:00.00 total for 444bf-r1, 555bf-r1",
    );
  });
});
