import {
  formatAttemptResultForN,
  resultsForView,
  orderedResultStats,
  timeNeededToOvertake,
} from "../result";

describe("orderedResultStats", () => {
  it("returns 'forFirst' and 'forThird' when forecase view is enabled", () => {
    const eventId = "333";
    const format = { numberOfAttempts: 5, sortBy: "average" };
    const bestStat = {
      name: "Best",
      field: "best",
      recordTagField: "singleRecordTag",
    };
    const averageStat = {
      name: "Average",
      field: "average",
      recordTagField: "averageRecordTag",
    };
    expect(orderedResultStats(eventId, format, false)).toMatchObject([
      averageStat,
      bestStat,
    ]);
    expect(orderedResultStats(eventId, format, true)).toMatchObject([
      averageStat,
      bestStat,
      { name: "For 1st", field: "forFirst" },
      { name: "For 3rd", field: "forThird" },
    ]);
  });
});

describe("formatAttemptResultForN", () => {
  it("Handles NA_VALUE and SUCCESS_VALUE", () => {
    expect(formatAttemptResultForN(-3, "333")).toEqual("N/A");
    expect(formatAttemptResultForN(-4, "333")).toEqual("SUCCESS");
    expect(formatAttemptResultForN(-1, "333")).toEqual("DNF");
  });
});

describe("viewResults", () => {
  it("returns unaltered results if forecastView is not enabled", () => {
    const results = [
      {
        best: 1000,
        average: 1000,
        attempts: [{ result: 1000 }, { result: 1000 }, { result: 1000 }],
      },
    ];
    expect(resultsForView(results, null, false)).toEqual(results);
  });

  it("computes projected average on all results", () => {
    const format = { numberOfAttempts: 3 };
    const results = [
      {
        attempts: [{ result: 1000 }, { result: 1200 }],
        best: 1000,
        average: 0,
      },
      {
        attempts: [{ result: 1300 }, { result: 1400 }, { result: 1500 }],
        best: 1300,
        average: 1400,
      },
      {
        attempts: [{ result: 2000 }, { result: 2200 }],
        best: 2000,
        average: 0,
      },
    ];

    const viewResults = resultsForView(results, format, true);
    expect(viewResults[0].projectedAverage).toEqual(1100);
    expect(viewResults[1].projectedAverage).toEqual(1400);
    expect(viewResults[2].projectedAverage).toEqual(2100);
  });

  it("ranks results based on projected average and sets advancing properties for unclinched results", () => {
    const format = { numberOfAttempts: 3 };
    const results = [
      {
        ranking: 1,
        attempts: [{ result: 10 }, { result: 10 }, { result: 10 }],
        best: 10,
        average: 10,
        // Clinched
        advancing: true,
        advancingQuestionable: false,
      },
      {
        ranking: 2,
        attempts: [{ result: 2000 }, { result: 2000 }, { result: 2000 }],
        best: 2000,
        average: 2000,
        advancing: true,
        advancingQuestionable: true,
      },
      {
        ranking: 3,
        attempts: [{ result: 1100 }],
        best: 1100,
        average: 0,
        advancing: true,
        advancingQuestionable: true,
      },
      {
        ranking: 3,
        attempts: [{ result: 1100 }],
        best: 1100,
        average: 0,
        advancing: true,
        advancingQuestionable: true,
      },
      {
        ranking: 5,
        attempts: [{ result: 1600 }, { result: 1200 }],
        best: 1200,
        average: 0,
        advancing: false,
        advancingQuestionable: false,
      },
      {
        ranking: 6,
        attempts: [{ result: 1300 }],
        best: 1300,
        average: 0,
        advancing: false,
        advancingQuestionable: false,
      },
    ];

    const viewResults = resultsForView(results, format, true);
    expect(viewResults[0]).toMatchObject({
      ranking: 1,
      attempts: [{ result: 10 }, { result: 10 }, { result: 10 }],
      best: 10,
      average: 10,
      projectedAverage: 10,
      advancing: true,
      advancingQuestionable: false,
    });
    expect(viewResults[1]).toMatchObject({
      ranking: 2,
      attempts: [{ result: 1100 }],
      best: 1100,
      average: 0,
      projectedAverage: 1100,
      advancing: true,
      advancingQuestionable: true,
    });
    expect(viewResults[2]).toMatchObject({
      ranking: 2,
      attempts: [{ result: 1100 }],
      best: 1100,
      average: 0,
      projectedAverage: 1100,
      advancing: true,
      advancingQuestionable: true,
    });
    expect(viewResults[3]).toMatchObject({
      ranking: 4,
      attempts: [{ result: 1300 }],
      best: 1300,
      average: 0,
      projectedAverage: 1300,
      advancing: false,
      advancingQuestionable: false,
    });
    expect(viewResults[4]).toMatchObject({
      ranking: 5,
      attempts: [{ result: 1600 }, { result: 1200 }],
      best: 1200,
      average: 0,
      projectedAverage: 1400,
      advancing: false,
      advancingQuestionable: false,
    });
    expect(viewResults[5]).toMatchObject({
      ranking: 6,
      attempts: [{ result: 2000 }, { result: 2000 }, { result: 2000 }],
      best: 2000,
      average: 2000,
      projectedAverage: 2000,
      advancing: false,
      advancingQuestionable: false,
    });
  });

  it("sets forFirst/forThird based on times needed to achieve 1st/3rd", () => {
    const format = { numberOfAttempts: 3 };
    const results = [
      {
        ranking: 1,
        attempts: [{ result: 100 }],
        best: 100,
        average: 0,
      },
      {
        ranking: 2,
        attempts: [{ result: 101 }],
        best: 101,
        average: 0,
      },
      {
        ranking: 3,
        attempts: [{ result: 102 }],
        best: 102,
        average: 0,
      },
      {
        ranking: 4,
        attempts: [{ result: 103 }],
        best: 103,
        average: 0,
      },
      {
        ranking: 5,
        attempts: [{ result: 104 }, { result: 104 }, { result: 104 }],
        best: 104,
        average: 104,
      },
    ];
    const viewResults = resultsForView(results, format, true);
    expect(viewResults[0]).toMatchObject({
      forFirst: 102,
      forThird: 106,
    });
    expect(viewResults[1]).toMatchObject({
      forFirst: 99,
      forThird: 105,
    });
    expect(viewResults[2]).toMatchObject({
      forFirst: 98,
      forThird: 104,
    });
    expect(viewResults[3]).toMatchObject({
      forFirst: 97,
      forThird: 101,
    });
    expect(viewResults[4]).toMatchObject({
      forFirst: 0,
      forThird: 0,
    });
  });
});

describe("timeNeededToOvertake", () => {
  it("returns DNF if overtake result is skipped", () => {
    expect(timeNeededToOvertake(null, null, { projectedAverage: 0 })).toEqual(
      -1
    );
  });

  it("handles results turning from a mean to an average", () => {
    const format = { numberOfAttempts: 5 };
    let result = { attempts: [{ result: 99 }, { result: 100 }], best: 99 };
    expect(
      timeNeededToOvertake(result, format, { best: 10, projectedAverage: 101 })
    ).toEqual(-1);
    expect(
      timeNeededToOvertake(result, format, { best: 100, projectedAverage: 100 })
    ).toEqual(-1);
    result = { attempts: [{ result: 100 }, { result: -1 }], best: 100 };
    expect(
      timeNeededToOvertake(result, format, { best: 100, projectedAverage: 110 })
    ).toEqual(109);
    expect(
      timeNeededToOvertake(result, format, { best: 101, projectedAverage: 110 })
    ).toEqual(110);
    expect(
      timeNeededToOvertake(result, format, { best: 50, projectedAverage: -1 })
    ).toEqual(-4);
    expect(
      timeNeededToOvertake(result, format, { best: 50, projectedAverage: 100 })
    ).toEqual(49);
    expect(
      timeNeededToOvertake(result, format, { best: 50, projectedAverage: 50 })
    ).toEqual(-3);
    result = { attempts: [{ result: -1 }, { result: -1 }], best: -1 };
    expect(
      timeNeededToOvertake(result, format, { best: -1, projectedAverage: -1 })
    ).toEqual(-4);
  });

  it("handles incomplete overtake results", () => {
    let overtakeResult = { best: 50, projectedAverage: -1 };
    const format = { numberOfAttempts: 5 };
    expect(
      timeNeededToOvertake(
        { best: 49, projectedAverage: 49, attempts: [{ result: 49 }] },
        format,
        overtakeResult
      )
    ).toEqual(-1);
    expect(
      timeNeededToOvertake(
        {
          best: 100,
          projectedAverage: 100,
          attempts: [
            { result: 100 },
            { result: 100 },
            { result: 100 },
            { result: 100 },
          ],
        },
        format,
        overtakeResult
      )
    ).toEqual(-1);
    expect(
      timeNeededToOvertake(
        {
          best: 100,
          projectedAverage: -1,
          attempts: [
            { result: 100 },
            { result: 100 },
            { result: -1 },
            { result: -1 },
          ],
        },
        format,
        overtakeResult
      )
    ).toEqual(49);
    expect(
      timeNeededToOvertake(
        {
          best: 100,
          projectedAverage: 100,
          attempts: [{ result: 100 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(-4);
    overtakeResult = { best: -1, projectedAverage: -1 };
    expect(
      timeNeededToOvertake(
        {
          best: -1,
          projectedAverage: -1,
          attempts: [{ result: -1 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(-4);
  });

  it("handles incomplete results", () => {
    const overtakeResult = { best: 50, projectedAverage: 50 };
    const format = { numberOfAttempts: 3 };
    expect(
      timeNeededToOvertake(
        {
          best: 50,
          projectedAverage: -1,
          attempts: [{ result: 50 }, { result: -1 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(-3);
  });

  it("handles overtake for mean", () => {
    let overtakeResult = { best: 100, projectedAverage: 100 };
    let format = { numberOfAttempts: 3 };
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(90);
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }, { result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(81);
    overtakeResult = { best: 50, projectedAverage: 100 };
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(88);
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }, { result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(78);

    overtakeResult = { best: 80, projectedAverage: 100 };
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }, { result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(79);

    format = { numberOfAttempts: 5 };
    overtakeResult = { best: 100, projectedAverage: 100 };
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(90);
  });

  it("handles overtake for average", () => {
    let overtakeResult = { best: 50, projectedAverage: 100 };
    const format = { numberOfAttempts: 5 };
    expect(
      timeNeededToOvertake(
        {
          best: 10,
          projectedAverage: 110,
          attempts: [{ result: 10 }, { result: 110 }, { result: -1 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(90);
    expect(
      timeNeededToOvertake(
        {
          best: 50,
          projectedAverage: 110,
          attempts: [{ result: 50 }, { result: 110 }, { result: -1 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(88);
    expect(
      timeNeededToOvertake(
        {
          best: 10,
          projectedAverage: 110,
          attempts: [
            { result: 10 },
            { result: 110 },
            { result: 110 },
            { result: 200 },
          ],
        },
        format,
        overtakeResult
      )
    ).toEqual(81);
    expect(
      timeNeededToOvertake(
        {
          best: 50,
          projectedAverage: 110,
          attempts: [
            { result: 50 },
            { result: 110 },
            { result: 110 },
            { result: 200 },
          ],
        },
        format,
        overtakeResult
      )
    ).toEqual(78);
    expect(
      timeNeededToOvertake(
        {
          best: 110,
          projectedAverage: 110,
          attempts: [{ result: 110 }, { result: 110 }, { result: 110 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(-3);
    expect(
      timeNeededToOvertake(
        {
          best: 90,
          projectedAverage: 90,
          attempts: [{ result: 90 }, { result: 90 }, { result: 90 }],
        },
        format,
        overtakeResult
      )
    ).toEqual(-1);
  });
});
