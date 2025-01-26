import {
    resultsForView,
    resultProjectedAverage
} from "../result";

describe("resultsForView", () => {
    it("returns unaltered results if forecastView is not enabled", () => {
        const results = [{ average: 100 }]
        expect(resultsForView(results, null, false)).toEqual(results);
    });

    const format = { numberOfAttempts: 3 };
    it("computes projected average on all results", () => {
        const results = [
            { average: 0, attempts: [{ result: 100 }] },
            { average: 0, attempts: [{ result: 101 }] }]
        const expandedResults = resultsForView(results, format, true);
        expect(expandedResults[0].projectedAverage).toEqual(100);
        expect(expandedResults[1].projectedAverage).toEqual(101);
    });

    it("sorts and ranks results based on projected average then best. Sets advancing properties for unclinched results", () => {
        const results = [
            { attempts: [{ result: 100 }], best: 100, average: 0 },
            { attempts: [{ result: 100 }], best: 99, average: 0, advancing: true, advancingQuestionable: false  },
            { attempts: [{ result: 102 }], best: 100, average: 0  },
            { attempts: [{ result: 101 }], best: 100, average: 0  },
            { attempts: [{ result: 101 }], best: 100, average: 0  }];
            const expandedResults = resultsForView(results, format, true);
            expect(expandedResults[0]).toMatchObject({
                projectedAverage: 100,
                best: 99,
                ranking: 1,
                advancing: true,
                advancingQuestionable: false,
            });
            expect(expandedResults[1]).toMatchObject({
                projectedAverage: 100,
                best: 100,
                ranking: 2,
                advancing: true,
                advancingQuestionable: true,
            });
            expect(expandedResults[2]).toMatchObject({
                projectedAverage: 101,
                best: 100,
                ranking: 3,
                advancing: true,
                advancingQuestionable: true,
            });
            expect(expandedResults[3]).toMatchObject({
                projectedAverage: 101,
                best: 100,
                ranking: 3,
                advancing: true,
                advancingQuestionable: true,
            });
            expect(expandedResults[4]).toMatchObject({
                projectedAverage: 102,
                best: 100,
                ranking: 5,
                advancing: false,
                advancingQuestionable: false,
            });
    });
});

describe("resultProjectedAverage", () => {
    it("Returns average if it is populated", () => {
        const format = { numberOfAttempts: 3 };
        var result = { average: 50, attempts: [{ result: 100 }] };
        expect(resultProjectedAverage(result, format)).toEqual(50);
        result = { average: 0, attempts: [{ result: 100 }] };
        expect(resultProjectedAverage(result, format)).toEqual(100);
    });
});