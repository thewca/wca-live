import { competitionCountries } from "../competition";

describe("competitionCountries", () => {
  test("returns a list with single country when the competition has one venue", () => {
    const competition = {
      id: "1",
      venues: [{ id: "1", country: { iso2: "FR", name: "France" } }],
    };
    expect(competitionCountries(competition)).toEqual([
      { iso2: "FR", name: "France" },
    ]);
  });

  test("returns a list of all countries with no duplicates when the competition has many venues", () => {
    const competition = {
      id: "1",
      venues: [
        { id: "1", country: { iso2: "FR", name: "France" } },
        { id: "2", country: { iso2: "FR", name: "France" } },
        { id: "3", country: { iso2: "GB", name: "United Kingdom" } },
      ],
    };
    expect(competitionCountries(competition)).toEqual([
      { iso2: "FR", name: "France" },
      { iso2: "GB", name: "United Kingdom" },
    ]);
  });
});
