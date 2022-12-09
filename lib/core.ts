import isNumber from "lodash/isNumber";
import has from "lodash/has";
import get from "lodash/get";
import set from "lodash/set";
import { acceptAllowedValue } from "./utils";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type Falsey = 0 | false | null | undefined;

export type GenericData = string | number | boolean | null | undefined;
export type RowData<Data = GenericData> = Data[];
export type TableData<Data = GenericData> = RowData<Data>[];

export type TableDataHeaderType = "row" | "column";
export interface TableDataHeader {
  header: TableDataConfigHeader;
  name: string;
  c: number;
  r: number;
  width: number;
  height: number;
}
export type TableDataHeaders = TableDataHeader[][];

export type TableDataConfigHeader = {
  type: TableDataHeaderType;
  c: number;
  r: number;
  depth: number;
};
export type TableDataConfigHeaders = Optional<TableDataConfigHeader, "depth">[];
export type TableDataConfigPreset =
  | "row"
  | "column"
  | "row.column"
  | "column.row"
  | "row.row"
  | "column.column"
  | Falsey;
export type TableDataConfigModifyHeaders = (headers: TableDataHeaders) => void;
export interface TableDataConfig {
  preset?: TableDataConfigPreset;
  headers?: TableDataConfigHeaders;
  modifyHeaders?: TableDataConfigModifyHeaders;
}

/**
 * Convert table-formatted data to a nested JSON object.
 *
 * Table data is structured as array of rows (Y axis), which
 * are each then an array of columns (X axis).
 *
 * Imagine a table:
 *
 * | a  | b  | c  |
 * |----|----|----|
 * |  1 |  2 |  3 |
 * | do | re | mi |
 *
 * Would be represented as table data like so:
 *
 * ```js
 * [
 *   [
 *     "a", "b", "c"
 *   ],
 *   [
 *     1, 2, 3
 *   ],
 *   [
 *     "do", "re", "mi"
 *   ]
 * ]
 * ```
 *
 * If the first row is the header, then the output would
 * look like this:
 *
 * ```json
 * [
 *   {
 *     "a": 1,
 *     "b": 2,
 *     "c": 3
 *   },
 *   {
 *     "a": "do"
 *     "b": "re",
 *     "c": "mi"
 *   }
 * ]
 * ```
 *
 * If the first column is the header, then the output would
 * look like this:
 *
 * ```json
 * [
 *   {
 *     "a": "b",
 *     "1": 2,
 *     "do": "re"
 *   },
 *   {
 *     "a": "c",
 *     "1": 3,
 *     "do": "mi"
 *   }
 * ]
 * ```
 *
 * We can also combine row and column headers to make
 * nested objects. We can provide the `headers` array of
 * objects to define type of header and column/row co-ords
 * of where the first cell of the header starts:
 *
 * ```js
 * headers = [
 *   {
 *     type: "row",
 *     c: 0,
 *     r: 0,
 *   },
 *   {
 *     type: "column",
 *     c: 0,
 *     r: 0,
 *   },
 * ];
 * ```
 *
 * As a shorthand, we can use the `preset` option which has
 * pre-configured `headers`:
 *
 * - `row`
 * - `column`
 * - `row.column`
 * - `column.row`
 * - `row.row`
 * - `column.column`
 */
export function convertTableDataToJSON<Data = GenericData, Output = object>(
  input: TableData<Data>,
  options?: TableDataConfig
): Output | Output[] {
  const _options: TableDataConfig = {
    preset: "row",
    headers: undefined,
    ...options,
  };

  acceptAllowedValue(
    _options.preset,
    [
      undefined,
      false,
      null,
      "row",
      "column",
      "row.column",
      "column.row",
      "row.row",
      "column.column",
    ],
    true
  );

  if (_options.headers) {
    _options.headers.forEach((h) => {
      acceptAllowedValue(
        h.type,
        [undefined, false, null, "row", "column"],
        true
      );
      acceptAllowedValue(h.c, isNumber, true);
      acceptAllowedValue(h.r, isNumber, true);
    });
  }

  // Configure first/second header defaults using preset
  if (!_options.headers || !_options.headers.length) {
    switch (_options.preset) {
      case "row":
      default:
        _options.headers = [
          {
            type: "row",
            c: 0,
            r: 0,
          },
        ];
        break;

      case "column":
        _options.headers = [
          {
            type: "column",
            c: 0,
            r: 0,
          },
        ];
        break;

      case "row.column":
        _options.headers = [
          {
            type: "row",
            c: 0,
            r: 0,
          },
          {
            type: "column",
            c: 0,
            r: 0,
          },
        ];
        break;

      case "column.row":
        _options.headers = [
          {
            type: "column",
            c: 0,
            r: 0,
          },
          {
            type: "row",
            c: 0,
            r: 0,
          },
        ];
        break;

      case "row.row":
        _options.headers = [
          {
            type: "row",
            c: 0,
            r: 0,
          },
          {
            type: "row",
            c: 0,
            r: 1,
          },
        ];
        break;

      case "column.column":
        _options.headers = [
          {
            type: "column",
            c: 0,
            r: 0,
          },
          {
            type: "column",
            c: 1,
            r: 0,
          },
        ];
        break;
    }
  }

  // Ensure each header config has a depth value based on the order they appear in the headers array
  _options.headers.forEach((h, index) => {
    h.depth = h.depth === undefined || h.depth !== index ? index : h.depth;
  });

  const _headers = _options.headers as TableDataConfigHeader[];
  const getHeaderRow = (c: number, r: number): TableDataConfigHeader[] =>
    _headers.filter(
      ({ type, c: x, r: y }) => type === "row" && c >= x && r === y
    );
  const getHeaderColumn = (c: number, r: number): TableDataConfigHeader[] =>
    _headers.filter(
      ({ type, c: x, r: y }) => type === "column" && c === x && r >= y
    );

  // Extract headers to determine data mapping and nesting
  const headers: TableDataHeaders = [];
  const maxColumns = input.reduce(
    (acc: number, row: RowData<Data>) => Math.max(acc, row.length),
    0
  );
  const maxRows = input.length;
  let startDataRIndex = Infinity;
  let startDataCIndex = Infinity;
  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < maxColumns; c++) {
      const headerRows = getHeaderRow(c, r);
      const headerColumns = getHeaderColumn(c, r);

      // Check contents exist, if so check if relevant header row/column and add entry
      const cell = get(input, [r, c]);
      if (cell !== undefined && cell !== null && cell !== "") {
        if (headerRows.length > 0) {
          headerRows.forEach((h) => {
            if (!headers[h.depth]) headers[h.depth] = [];
            headers[h.depth].push({
              header: h,
              name: (cell + "").trim(),
              c,
              r,
              width: 1,
              height: 1,
            });
            startDataRIndex = Math.min(startDataRIndex, r + 1);
          });
        }

        if (headerColumns.length > 0) {
          headerColumns.forEach((h) => {
            if (!headers[h.depth]) headers[h.depth] = [];
            headers[h.depth].push({
              header: h,
              name: (cell + "").trim(),
              c,
              r,
              width: 1,
              height: 1,
            });
            startDataCIndex = Math.min(startDataCIndex, c + 1);
          });
        }
      }
    }
  }

  // Extra plugin functionality to modify the headers before
  // processing output data.
  if (typeof _options.modifyHeaders === "function") {
    _options.modifyHeaders(headers);
  }

  startDataRIndex = startDataRIndex === Infinity ? 0 : startDataRIndex;
  startDataCIndex = startDataCIndex === Infinity ? 0 : startDataCIndex;

  // Get the cell headers for a specific cell
  const getCellHeaders = (c: number, r: number) => {
    let cellHeaders: TableDataHeader[][] = [];
    headers.forEach((cells, depth) => {
      const _cellHeaders = cells.filter((h) => {
        const cMin = h.c;
        const cMax = h.c + h.width;
        const rMin = h.r;
        const rMax = h.r + h.height;
        const isWithin =
          h.header.type === "row"
            ? c >= cMin && c < cMax
            : r >= rMin && r < rMax;
        return isWithin;
      });

      cellHeaders[depth] = _cellHeaders;
    });

    // Ensure to remove any empty axes
    return cellHeaders.filter((cells) => cells.length);
  };

  const addCellToCollection = ({
    c,
    r,
    collection,
  }: {
    c: number;
    r: number;
    collection: Output;
  }) => {
    const cell = get(input, [r, c]);
    const cellHeaders = getCellHeaders(c, r);

    // Avoid setting header values as cell values
    let setCell = true;
    for (let depth = 0; depth < cellHeaders.length; depth++) {
      for (let index = 0; index < cellHeaders[depth].length; index++) {
        const headerName = cellHeaders[depth][index].name;

        if (cell === headerName) {
          setCell = false;
          break;
        }
      }
      if (!setCell) break;
    }
    if (!setCell) return;

    // Make sure any nested objects exist
    const cellObjectPath: (string | number)[] = [];
    cellHeaders.forEach((cells, depth) => {
      cells.forEach((h) => {
        cellObjectPath[depth] = h.name;
        if (!has(collection, cellObjectPath))
          set(collection as object, cellObjectPath, {});
      });
    });

    // Set the cell value
    set(collection as object, cellObjectPath, cell);
  };

  const entryAxis = headers[0][0].header.type;

  // Perpendicular axis (e.g. `row.column`, `column.row`) affects
  // output, whether it is array of entries, or just an object
  // with entries as props.
  const hasPerpendicularAxis =
    headers.length > 0 &&
    new Set(headers.map((headerCells) => headerCells[0].header.type)).size > 1;
  const output = hasPerpendicularAxis ? ({} as Output) : ([] as Output[]);

  // Entries are represented by rows, individual cells by columns
  if (entryAxis === "row") {
    for (let r = startDataRIndex; r < maxRows; r++) {
      const collection = output instanceof Array ? ({} as Output) : output;

      for (let c = startDataCIndex; c < maxColumns; c++) {
        addCellToCollection({
          c,
          r,
          collection,
        });
      }

      if (
        output instanceof Array &&
        Object.keys(collection as Output[]).length
      ) {
        output.push(collection);
      }
    }
  } else {
    // Entries are represented by columns, individual cells by rows
    for (let c = startDataCIndex; c < maxColumns; c++) {
      const collection = output instanceof Array ? ({} as Output) : output;

      for (let r = startDataRIndex; r < maxRows; r++) {
        addCellToCollection({
          c,
          r,
          collection,
        });
      }

      if (
        output instanceof Array &&
        Object.keys(collection as Output[]).length
      ) {
        output.push(collection);
      }
    }
  }

  return output;
}

export default convertTableDataToJSON;
