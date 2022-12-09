declare type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
declare type Falsey = 0 | false | null | undefined;
export declare type GenericData = string | number | boolean | null | undefined;
export declare type RowData<Data = GenericData> = Data[];
export declare type TableData<Data = GenericData> = RowData<Data>[];
export declare type TableDataHeaderType = "row" | "column";
export interface TableDataHeader {
    header: TableDataConfigHeader;
    name: string;
    c: number;
    r: number;
    width: number;
    height: number;
}
export declare type TableDataHeaders = TableDataHeader[][];
export declare type TableDataConfigHeader = {
    type: TableDataHeaderType;
    c: number;
    r: number;
    depth: number;
};
export declare type TableDataConfigHeaders = Optional<TableDataConfigHeader, "depth">[];
export declare type TableDataConfigPreset = "row" | "column" | "row.column" | "column.row" | "row.row" | "column.column" | Falsey;
export declare type TableDataConfigModifyHeaders = (headers: TableDataHeaders) => void;
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
export declare function convertTableDataToJSON<Data = GenericData, Output = object>(input: TableData<Data>, options?: TableDataConfig): Output | Output[];
export default convertTableDataToJSON;
