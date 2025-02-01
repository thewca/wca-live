import { resultsForView } from "../result";

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
});
