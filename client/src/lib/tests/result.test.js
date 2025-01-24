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
            { attempts: [{ result: 100 }]},
            { attempts: [{ result: 101 }] }]
        const expandedResults = resultsForView(results, format, true);
        expect(expandedResults[0].projectedAverage).toEqual(100);
        expect(expandedResults[1].projectedAverage).toEqual(101);
    });
    
    it("sorts and ranks results based on projected average then best. Sets advancing questionable for top 3", () => {
        const results = [
            { attempts: [{ result: 100 }], best: 100, average: 0 },
            { attempts: [{ result: 100 }], best: 99, average: 0  },
            { attempts: [{ result: 102 }], best: 100, average: 0  },
            { attempts: [{ result: 101 }], best: 100, average: 0  },
            { attempts: [{ result: 101 }], best: 100, average: 0  }];
            const expandedResults = resultsForView(results, format, true);
            expect(expandedResults[0].projectedAverage).toEqual(100);
            expect(expandedResults[0].best).toEqual(99);
            expect(expandedResults[0].ranking).toEqual(1);
            expect(expandedResults[0].advancingQuestionable).toEqual(true);
            expect(expandedResults[1].projectedAverage).toEqual(100);
            expect(expandedResults[1].best).toEqual(100);
            expect(expandedResults[1].ranking).toEqual(2);
            expect(expandedResults[1].advancingQuestionable).toEqual(true);
            expect(expandedResults[2].projectedAverage).toEqual(101);
            expect(expandedResults[2].ranking).toEqual(3);
            expect(expandedResults[2].advancingQuestionable).toEqual(true);
            expect(expandedResults[3].projectedAverage).toEqual(101);
            expect(expandedResults[3].ranking).toEqual(3);
            expect(expandedResults[3].advancingQuestionable).toEqual(true);
            expect(expandedResults[4].projectedAverage).toEqual(102);
            expect(expandedResults[4].ranking).toEqual(5);
            expect(expandedResults[4].advancingQuestionable).toEqual(false);
    });
});

describe("resultProjectedAverage", () => {
    it("Returns average if it is populated", () => {
        const format = { numberOfAttempts: 3};
        var result = {average: 50, attempts: [{result: 100}]};
        expect(resultProjectedAverage(result, format)).toEqual(50);
        result = {attempts: [{result: 100}]};
        expect(resultProjectedAverage(result, format)).toEqual(100);
      });
});