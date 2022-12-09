import { TableData, convertTableDataToJSON } from "../../lib/core";

const testTableDataRow: TableData = [
  ["Test 1", "Test 2", "Test 3"],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];

const testTableDataColumn: TableData = [
  ["Test 1", 1, 2, 3],
  ["Test 2", 4, 5, 6],
  ["Test 3", 7, 8, 9],
];

const testTableDataRowColumn: TableData = [
  ["", "0", "1", "2"],
  ["Test 1", 1, 2, 3],
  ["Test 2", 4, 5, 6],
  ["Test 3", 7, 8, 9],
];

const testTableDataColumnRow: TableData = [
  ["", "Test 1", "Test 2", "Test 3"],
  ["0", 1, 4, 7],
  ["1", 2, 5, 8],
  ["2", 3, 6, 9],
];

const testTableDataRowRow: TableData = [
  ["0", "1", "2"],
  ["Test 1", "Test 2", "Test 3"],
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const testTableDataColumnColumn: TableData = [
  ["0", "Test 1", 1, 4, 7],
  ["1", "Test 2", 2, 5, 8],
  ["2", "Test 3", 3, 6, 9],
];

const testTableDataCustom: TableData = [
  ["", "", "0", "1", "2"],
  ["", "Test 1", 1, 2, 3],
  ["", "Test 2", 4, 5, 6],
  ["", "Test 3", 7, 8, 9],
];

it("should parse table data by row preset (default when undefined)", () => {
  const output = convertTableDataToJSON(testTableDataRow);
  expect(output).toHaveLength(3);
  expect(output).toMatchSnapshot();
});

it("should parse table data by row preset", () => {
  const output = convertTableDataToJSON(testTableDataRow, {
    preset: "row",
  });

  expect(output).toHaveLength(3);
  expect(output).toMatchSnapshot();
});

it("should parse table data by column preset", () => {
  const output = convertTableDataToJSON(testTableDataColumn, {
    preset: "column",
  });

  expect(output).toHaveLength(3);
  expect(output).toMatchSnapshot();
});

it("should parse table data by row.column preset", () => {
  const output = convertTableDataToJSON(testTableDataRowColumn, {
    preset: "row.column",
  });

  expect(output).not.toBeInstanceOf(Array);
  expect(output).toMatchSnapshot();
});

it("should parse table data by column.row preset", () => {
  const output = convertTableDataToJSON(testTableDataColumnRow, {
    preset: "column.row",
  });

  expect(output).not.toBeInstanceOf(Array);
  expect(output).toMatchSnapshot();
});

it("should parse table data by row.row preset", () => {
  const output = convertTableDataToJSON(testTableDataRowRow, {
    preset: "row.row",
  });

  expect(output).toHaveLength(3);
  expect(output).toMatchSnapshot();
});

it("should parse table data by column.coumn preset", () => {
  const output = convertTableDataToJSON(testTableDataColumnColumn, {
    preset: "column.column",
  });

  expect(output).toHaveLength(3);
  expect(output).toMatchSnapshot();
});

it("should parse table data using headers option", () => {
  const output = convertTableDataToJSON(testTableDataCustom, {
    headers: [
      {
        type: "row",
        c: 2,
        r: 0,
      },
      {
        type: "column",
        c: 1,
        r: 1,
      },
    ],
  });

  expect(output).not.toBeInstanceOf(Array);
  expect(output).toMatchSnapshot();
});

it("should modify headers using modifyHeaders option", () => {
  const modifyHeaders = jest.fn();

  convertTableDataToJSON(testTableDataRow, {
    preset: "row",
    modifyHeaders,
  });

  const modifyHeadersArgs = modifyHeaders.mock.calls[0];
  expect(modifyHeaders).toBeCalledTimes(1);
  expect(modifyHeadersArgs[0]).toBeInstanceOf(Array);
  expect(modifyHeadersArgs[0][0]).toHaveLength(3);
});
