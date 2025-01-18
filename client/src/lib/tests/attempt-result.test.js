import {
  best,
  bestPossibleAverage,
  average,
  formatAttemptResult,
  decodeMbldAttemptResult,
  encodeMbldAttemptResult,
  autocompleteMbldDecodedValue,
  autocompleteFmAttemptResult,
  autocompleteTimeAttemptResult,
  meetsCutoff,
  attemptResultsWarning,
  applyTimeLimit,
  applyCutoff,
  isWorldRecord,
  worstPossibleAverage,
  incompleteMean,
  DNF_VALUE,
  DNS_VALUE,
} from "../attempt-result";

describe("best", () => {
  it("returns 0 (skipped) if all attempt results are skipped", () => {
    expect(best([])).toEqual(0);
    expect(best([0, 0, 0])).toEqual(0);
    expect(best([0, 0, 0, 0, 0])).toEqual(0);
  });

  it("returns -1 (DNF) if there are DNFs and no successful attempt results", () => {
    expect(best([-1])).toEqual(-1);
    expect(best([-1, -1, -2])).toEqual(-1);
    expect(best([-1, -1, 0, 0, 0])).toEqual(-1);
  });

  it("returns -2 (DNS) if DNSes are the only non-skipped attempt results", () => {
    expect(best([-2])).toEqual(-2);
    expect(best([-2, -2])).toEqual(-2);
    expect(best([-2, 0])).toEqual(-2);
  });

  it("returns the best result if there are some successful attempt results", () => {
    expect(best([1000])).toEqual(1000);
    expect(best([980, -1, -2])).toEqual(980);
    expect(best([1100, 1200, 980, 950, 890])).toEqual(890);
  });
});

describe("average", () => {
  it("throws an error if no event id is given", () => {
    expect(() => {
      average([1000, 1100, 1200]);
    }).toThrow("Missing argument: eventId");
  });

  it("throws an error if the number of attempt results is neither 3 nor 5", () => {
    expect(() => {
      average([1100, 900], "333");
    }).toThrow("Invalid number of attempt results, expected 3 or 5, got 2.");
  });

  it("returns 0 (skipped) for 3x3x3 Multi-Blind", () => {
    expect(average([970360001, 970360001, 970360001], "333mbf")).toEqual(0);
  });

  it("returns 0 (skipped) if any attempt result is skipped", () => {
    expect(average([1000, 1100, 1300, 0, 1200], "333")).toEqual(0);
  });

  it("returns -1 (DNF) if any unsuccessful attempt result is counting", () => {
    expect(average([980, -1, 1010], "333")).toEqual(-1);
    expect(average([980, 900, -2], "333")).toEqual(-1);
    expect(average([-1, 980, 890, -1, 910], "333")).toEqual(-1);
    expect(average([-1, 980, -2, 890, 910], "333")).toEqual(-1);
  });

  it("trims best and worst in case of 5 attempt results", () => {
    expect(average([900, 800, 700, 4000, 600], "333")).toEqual(800);
    expect(average([900, 800, 700, 1000, 300], "333")).toEqual(800);
    expect(average([-1, 600, 600, 600, 500], "333")).toEqual(600);
  });

  it("does not trim best and worst in case of 3 attempt results", () => {
    expect(average([400, 500, 900], "333")).toEqual(600);
  });

  it("truncates averages over 10 minutes to seconds", () => {
    expect(average([60041, 60041, 60041], "333")).toEqual(60000);
    expect(average([60051, 60051, 60051], "333")).toEqual(60000);
  });

  it("returns correct average for 3x3x3 Fewest Moves", () => {
    expect(average([24, 25, 26], "333fm")).toEqual(2500);
    expect(average([24, 24, 25], "333fm")).toEqual(2433);
  });
});

describe("formatAttemptResult", () => {
  test("returns an empty string for value 0", () => {
    expect(formatAttemptResult(0, "333")).toEqual("");
  });

  test("returns DNF for value -1", () => {
    expect(formatAttemptResult(-1, "333")).toEqual("DNF");
  });

  test("returns DNS for value -2", () => {
    expect(formatAttemptResult(-2, "333")).toEqual("DNS");
  });

  test("strips leading zeros", () => {
    expect(formatAttemptResult(150, "333")).toEqual("1.50");
    expect(formatAttemptResult(60 * 100, "333")).toEqual("1:00.00");
    expect(formatAttemptResult(60 * 60 * 100 + 15, "333")).toEqual(
      "1:00:00.15"
    );
  });

  test("returns one leading zero for results under 1 second", () => {
    expect(formatAttemptResult(15, "333")).toEqual("0.15");
  });

  describe("when 3x3x3 Fewest Moves result is given", () => {
    test("formats single result correctly", () => {
      expect(formatAttemptResult(28, "333fm")).toEqual("28");
    });

    test("formats average result correctly", () => {
      expect(formatAttemptResult(2833, "333fm", true)).toEqual("28.33");
    });
  });

  describe("when 3x3x3 Multi-Blind result is given", () => {
    test("shows number of solved/attempted cubes and time without centiseconds", () => {
      expect(formatAttemptResult(900348002, "333mbf")).toEqual("11/13 58:00");
      expect(formatAttemptResult(970360001, "333mbf")).toEqual("3/4 1:00:00");
    });
  });
});

describe("decodeMbldAttemptResult", () => {
  test("correctly decodes DNF, DNS and skipped", () => {
    expect(decodeMbldAttemptResult(0)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: 0,
    });
    expect(decodeMbldAttemptResult(-1)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
    expect(decodeMbldAttemptResult(-2)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -2,
    });
  });

  test("correctly decodes successful attempt", () => {
    const decoded = { solved: 11, attempted: 13, centiseconds: 3480 * 100 };
    expect(decodeMbldAttemptResult(900348002)).toEqual(decoded);
  });
});

describe("encodeMbldAttemptResult", () => {
  test("correctly encodes DNF, DNS and skipped", () => {
    expect(encodeMbldAttemptResult({ centiseconds: 0 })).toEqual(0);
    expect(encodeMbldAttemptResult({ centiseconds: -1 })).toEqual(-1);
    expect(encodeMbldAttemptResult({ centiseconds: -2 })).toEqual(-2);
  });

  test("correctly encodes successful attempt", () => {
    const decoded = { solved: 11, attempted: 13, centiseconds: 3480 * 100 };
    expect(encodeMbldAttemptResult(decoded)).toEqual(900348002);
  });

  test("rounds centiseconds to seconds", () => {
    const decoded = {
      solved: 11,
      attempted: 13,
      centiseconds: 3480 * 100 + 50,
    };
    expect(encodeMbldAttemptResult(decoded)).toEqual(900348102);
  });
});

describe("autocompleteMbldDecodedValue", () => {
  test("sets attempted to solved when attempted is 0", () => {
    const decoded = { solved: 2, attempted: 0, centiseconds: 6000 };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 2,
      attempted: 2,
      centiseconds: 6000,
    });
  });

  test("sets attempted to solved when more cubes are solved than attempted", () => {
    const decoded = { solved: 3, attempted: 2, centiseconds: 6000 };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 3,
      attempted: 3,
      centiseconds: 6000,
    });
  });

  test("returns DNF if the number of points is less than 0", () => {
    const decoded = { solved: 2, attempted: 5, centiseconds: 6000 };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test("returns DNF when 1 of 2 cubes is solved", () => {
    const decoded = { solved: 1, attempted: 2, centiseconds: 6000 };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test("returns DNF if the time limit is exceeded", () => {
    const decoded = { solved: 2, attempted: 3, centiseconds: 40 * 60 * 100 };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 0,
      attempted: 0,
      centiseconds: -1,
    });
  });

  test("allows several seconds over the time limit for +2s", () => {
    const decoded = {
      solved: 2,
      attempted: 3,
      centiseconds: 30 * 60 * 100 + 12 * 100,
    };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 2,
      attempted: 3,
      centiseconds: 30 * 60 * 100 + 12 * 100,
    });
  });

  test("returns the same value if everything is ok", () => {
    const decoded = { solved: 11, attempted: 12, centiseconds: 60 * 60 * 100 };
    expect(autocompleteMbldDecodedValue(decoded)).toEqual({
      solved: 11,
      attempted: 12,
      centiseconds: 60 * 60 * 100,
    });
  });
});

describe("autocompleteFmAttemptResult", () => {
  test("returns DNF if the number of moves exceeds 80", () => {
    expect(autocompleteFmAttemptResult(81)).toEqual(-1);
  });

  test("returns the same value if everything is ok", () => {
    expect(autocompleteFmAttemptResult(25)).toEqual(25);
    expect(autocompleteFmAttemptResult(-1)).toEqual(-1);
  });
});

describe("autocompleteTimeAttemptResult", () => {
  test("truncates averages over 10 minutes to seconds", () => {
    expect(autocompleteTimeAttemptResult(60041)).toEqual(60000);
    expect(autocompleteTimeAttemptResult(60051)).toEqual(60000);
  });

  test("returns the same value if everything is ok", () => {
    expect(autocompleteTimeAttemptResult(900)).toEqual(900);
    expect(autocompleteTimeAttemptResult(-1)).toEqual(-1);
  });
});

describe("meetsCutoff", () => {
  it("returns true when no cutoff is given", () => {
    const attemptResults = [-1, -1];
    expect(meetsCutoff(attemptResults, null)).toEqual(true);
  });

  it("returns true if one of attempt results before cutoff is better than cutoff value", () => {
    const attemptResults = [1000, 850, 0, 0, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 900 };
    expect(meetsCutoff(attemptResults, cutoff)).toEqual(true);
  });

  it("returns false if one of further attempt results is better than cutoff", () => {
    const attemptResults = [1000, 950, 800, 0, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 900 };
    expect(meetsCutoff(attemptResults, cutoff)).toEqual(false);
  });

  it("requires attempt results better than the cutoff", () => {
    const attemptResults = [900, 700, 0];
    const cutoff = { numberOfAttempts: 2, attemptResult: 700 };
    expect(meetsCutoff(attemptResults, cutoff)).toEqual(false);
  });
});

describe("isWorldRecord", () => {
  it("returns true when a new world record average is achieved", () => {
    const attemptResult = 500;
    const worldRecords = [
      {
        type: "average",
        event: {
          id: "333",
        },
        attemptResult: 701,
      },
    ];
    expect(isWorldRecord(attemptResult, "333", "average", worldRecords)).toBe(
      true
    );
  });

  it("returns false when a new world record average is not achieved", () => {
    const attemptResults = 500;
    const worldRecords = [
      {
        type: "average",
        event: {
          id: "333",
        },
        attemptResult: 200,
      },
    ];
    expect(isWorldRecord(attemptResults, "333", "average", worldRecords)).toBe(
      false
    );
  });

  it("returns true when a new world record single is achieved", () => {
    const attemptResult = 500;
    const worldRecords = [
      {
        type: "single",
        event: {
          id: "333",
        },
        attemptResult: 701,
      },
    ];
    expect(isWorldRecord(attemptResult, "333", "single", worldRecords)).toBe(
      true
    );
  });

  it("returns false when a new world record single is not achieved", () => {
    const attemptResults = 500;
    const worldRecords = [
      {
        type: "single",
        event: {
          id: "333",
        },
        attemptResult: 200,
      },
    ];
    expect(isWorldRecord(attemptResults, "333", "single", worldRecords)).toBe(
      false
    );
  });

  it("returns false when there is no world record of a given type", () => {
    const attemptResults = 500;
    const worldRecords = [
      // no MBLD average world record
    ];
    expect(
      isWorldRecord(attemptResults, "333mbf", "average", worldRecords)
    ).toBe(false);
  });
});

describe("attemptResultsWarning", () => {
  const normalize = (obj) =>
    Object.entries(obj).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.replace(/\s+/g, " "),
      }),
      {}
    );

  describe("when 3x3x3 Multi-Blind attempt results are given", () => {
    it("returns a warning if an attempt has impossibly low time", () => {
      const attemptResults = [970360001, 970006001];
      expect(
        normalize(attemptResultsWarning(attemptResults, "333mbf", []))
      ).toMatchObject({
        description:
          "The result you're trying to submit seems to be impossible: attempt 2 is done in less than 30 seconds per cube tried. If you want to enter minutes, don't forget to add two zeros for centiseconds at the end of the score.",
      });
    });

    it("returns a warning if an attempt breaks a world record", () => {
      const attemptResults = [970360001, 970006001];
      const worldRecords = [
        {
          type: "single",
          event: {
            id: "333mbf",
          },
          attemptResult: 980000000,
        },
      ];
      expect(
        normalize(attemptResultsWarning(attemptResults, "333mbf", worldRecords))
      ).toMatchObject({
        description: `The result you're trying to submit includes a new world record single (3/4 1:00). Please check that you are entering results for the right event and that all the entered attempts are accurate. Type "world record" below to confirm that you are confident that it is indeed a world record result.`,
        confirmationKeyword: "world record",
      });
    });
  });

  it("returns a warning if best and worst attempt results are far apart", () => {
    const attemptResults = [500, 1000, 2500];
    expect(
      normalize(attemptResultsWarning(attemptResults, "333", []))
    ).toMatchObject({
      description:
        "The result you're trying to submit seem to be inconsistent. There's a big difference between the best single (5.00) and the worst single (25.00). Please check that the results are accurate.",
    });
  });

  it("returns null if attempt results do not look suspicious", () => {
    const attemptResults = [900, 1000, 800];
    expect(attemptResultsWarning(attemptResults, "333", [])).toEqual(null);
  });

  it("does not treat DNF as being far apart from other attempt results", () => {
    const attemptResults = [-1, 1000, 2500];
    expect(attemptResultsWarning(attemptResults, "333", [])).toEqual(null);
  });

  it("warns about DNS followed by a valid attempt result", () => {
    const attemptResults = [2000, DNS_VALUE, 2500, DNF_VALUE, 2000];
    expect(attemptResultsWarning(attemptResults, "333", [])).toMatchObject({
      description:
        "There's at least one DNS followed by a valid result. Please ensure it is indeed a DNS and not a DNF.",
    });
  });

  it("returns a warning if an attempt result is omitted", () => {
    const attemptResults = [1000, 0, 900];
    expect(attemptResultsWarning(attemptResults, "333")).toMatchObject({
      description: "You've omitted attempt 2. Make sure it's intentional.",
    });
  });

  it("does not treat trailing skipped attempt results as omitted", () => {
    const attemptResults = [1000, 0, 0];
    expect(attemptResultsWarning(attemptResults, "333", [])).toEqual(null);
  });

  it("returns a warning if an attempt breaks a world record single", () => {
    const attemptResults = [398, 401, 404];
    const worldRecords = [
      {
        type: "single",
        event: {
          id: "333",
        },
        attemptResult: 400,
      },
    ];
    expect(
      normalize(attemptResultsWarning(attemptResults, "333", worldRecords))
    ).toMatchObject({
      description: `The result you're trying to submit includes a new world record single (3.98). Please check that you are entering results for the right event and that all the entered attempts are accurate. Type "world record" below to confirm that you are confident that it is indeed a world record result.`,
      confirmationKeyword: "world record",
    });
  });

  it("returns a warning if the results break the world record average", () => {
    const attemptResults = [300, 400, 500, 600, 700];
    const worldRecords = [
      {
        type: "average",
        event: {
          id: "333",
        },
        attemptResult: 501,
      },
    ];
    expect(
      normalize(attemptResultsWarning(attemptResults, "333", worldRecords))
    ).toMatchObject({
      description: `The result you're trying to submit is a new world record average (5.00). Please check that you are entering results for the right event and that all the entered attempts are accurate. Type "world record" below to confirm that you are confident that it is indeed a world record result.`,
      confirmationKeyword: "world record",
    });
  });

  it("does not return a world record warning when average is DNF", () => {
    const attemptResults = [300, 400, -1, 600, -1];
    const worldRecords = [
      {
        type: "average",
        event: {
          id: "333",
        },
        attemptResult: 501,
      },
    ];
    expect(attemptResultsWarning(attemptResults, "333", worldRecords)).toEqual(
      null
    );
  });

  it("does not check for world record average if there are not enough attempts", () => {
    const attemptResults = [19];
    const worldRecords = [
      {
        type: "single",
        event: {
          id: "333fm",
        },
        attemptResult: 18,
      },
      {
        type: "average",
        event: {
          id: "333fm",
        },
        attemptResult: 2000,
      },
    ];
    expect(
      attemptResultsWarning(attemptResults, "333fm", worldRecords)
    ).toEqual(null);
  });
});

describe("applyTimeLimit", () => {
  describe("when a non-cumulative time limit is given", () => {
    it("sets DNF for attempt results exceeding the time limit", () => {
      const attemptResults = [1000, 1250, 1100, 1300, 0];
      const timeLimit = {
        cumulativeRoundWcifIds: [],
        centiseconds: 1250,
      };
      expect(applyTimeLimit(attemptResults, timeLimit)).toEqual([
        1000, -1, 1100, -1, 0,
      ]);
    });
  });

  describe("when a single round cumulative time limit is given", () => {
    it("sets DNF for once attempt results in total start to exceed the time limit", () => {
      const attemptResults = [3000, 12000, 5000];
      const timeLimit = {
        cumulativeRoundWcifIds: ["333bf"],
        centiseconds: 20000,
      };
      expect(applyTimeLimit(attemptResults, timeLimit)).toEqual([
        3000, 12000, -1,
      ]);
    });
  });
});

describe("applyCutoff", () => {
  it("sets further attempt results to skipped if the cutoff is not met", () => {
    const attempts = [1000, 800, 1200, 0, 0];
    const cutoff = {
      numberOfAttempts: 2,
      attemptResult: 800,
    };
    expect(applyCutoff(attempts, cutoff)).toEqual([1000, 800, 0, 0, 0]);
  });

  it("leaves attempt results unchanged if the cutoff is met", () => {
    const attempts = [1000, 799, 1200, 1000, 900];
    const cutoff = {
      numberOfAttempts: 2,
      attemptResult: 800,
    };
    expect(applyCutoff(attempts, cutoff)).toEqual([1000, 799, 1200, 1000, 900]);
  });
});

describe("worstPossibleAverage", () => {
  it("returns -1 if any attempt result is DNF", () => {
    const attemptResults = [1000, -1, 1200, 1300];
    expect(worstPossibleAverage(attemptResults)).toEqual(-1);
  });

  it("calculates average of 5 assuming worst attempt result", () => {
    const attemptResults = [3642, 3102, 3001, 2992];
    expect(worstPossibleAverage(attemptResults)).toEqual(3248);
  });
});

describe("bestPossibleAverage", () => {
  it("returns -1 if two attempts result are DNFs", () => {
    const attemptResults = [1000, -1, 1200, -1];
    expect(bestPossibleAverage(attemptResults)).toEqual(-1);
  });

  it("calculates average of 5 assuming best attempt result", () => {
    const attemptResults = [3642, 3102, 3001, 2992];
    expect(bestPossibleAverage(attemptResults)).toEqual(3032);
  });
});

describe("incompleteMean", () => {
  it("returns -1 if any attempt result is DNF", () => {
    const attemptResults = [21, -1];
    expect(incompleteMean(attemptResults, "333fm")).toEqual(-1);
  });

  it("calculates mean of 2", () => {
    const attemptResults = [21, 23];
    expect(incompleteMean(attemptResults, "333fm")).toEqual(2200);
  });
});
