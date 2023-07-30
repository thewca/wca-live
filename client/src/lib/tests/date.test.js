import { formatDateRange } from "../date";

describe("formatDateRange", () => {
  test("formats just one date when the start and end dates are the same", () => {
    const start = "2020-05-10";
    const end = "2020-05-10";
    expect(formatDateRange(start, end)).toEqual("May 10, 2020");
  });

  test("does not repeat the month when it is the same for start and end dates", () => {
    const start = "2020-05-10";
    const end = "2020-05-12";
    expect(formatDateRange(start, end)).toEqual("May 10 - 12, 2020");
  });

  test("does not repeat the year when it is the same for start and end dates", () => {
    const start = "2020-05-10";
    const end = "2020-07-05";
    expect(formatDateRange(start, end)).toEqual("May 10 - Jul 5, 2020");
  });

  test("returns full date range when year is different for start and end dates", () => {
    const start = "2020-05-10";
    const end = "2021-05-05";
    expect(formatDateRange(start, end)).toEqual("May 10, 2020 - May 5, 2021");
  });
});
