import convertTableDataToJSON from "../../dist/index";
import { GenericData, TableData } from "../../dist/lib/core";

it("should import correct", () => {
  expect(convertTableDataToJSON).toBeInstanceOf(Function);
});

it("example: row", () => {
  const input: TableData<GenericData> = [
    ["a", "b", "c"],
    [1, 2, 3],
    ["do", "re", "mi"],
  ];

  expect(convertTableDataToJSON(input, { preset: "row" }))
    .toMatchInlineSnapshot(`
    [
      {
        "a": 1,
        "b": 2,
        "c": 3,
      },
      {
        "a": "do",
        "b": "re",
        "c": "mi",
      },
    ]
  `);
});

it("example: column", () => {
  const input: TableData<GenericData> = [
    ["a", "b", "c"],
    [1, 2, 3],
    ["do", "re", "mi"],
  ];

  expect(convertTableDataToJSON(input, { preset: "column" }))
    .toMatchInlineSnapshot(`
    [
      {
        "1": 2,
        "a": "b",
        "do": "re",
      },
      {
        "1": 3,
        "a": "c",
        "do": "mi",
      },
    ]
  `);
});

it("example: row.column", () => {
  const input: TableData<GenericData> = [
    ["", "Tom", "Dick", "Harriette"],
    ["Age", 24, 32, 40],
    ["Country", "NZ", "AU", "FR"],
  ];

  expect(convertTableDataToJSON(input, { preset: "row.column" }))
    .toMatchInlineSnapshot(`
    {
      "Dick": {
        "Age": 32,
        "Country": "AU",
      },
      "Harriette": {
        "Age": 40,
        "Country": "FR",
      },
      "Tom": {
        "Age": 24,
        "Country": "NZ",
      },
    }
  `);
});
