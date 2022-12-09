"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTableDataToJSON = void 0;
var tslib_1 = require("tslib");
var isNumber_1 = tslib_1.__importDefault(require("lodash/isNumber"));
var has_1 = tslib_1.__importDefault(require("lodash/has"));
var get_1 = tslib_1.__importDefault(require("lodash/get"));
var set_1 = tslib_1.__importDefault(require("lodash/set"));
var utils_1 = require("./utils");
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
function convertTableDataToJSON(input, options) {
    var _options = tslib_1.__assign({ preset: "row", headers: undefined }, options);
    (0, utils_1.acceptAllowedValue)(_options.preset, [
        undefined,
        false,
        null,
        "row",
        "column",
        "row.column",
        "column.row",
        "row.row",
        "column.column",
    ], true);
    if (_options.headers) {
        _options.headers.forEach(function (h) {
            (0, utils_1.acceptAllowedValue)(h.type, [undefined, false, null, "row", "column"], true);
            (0, utils_1.acceptAllowedValue)(h.c, isNumber_1.default, true);
            (0, utils_1.acceptAllowedValue)(h.r, isNumber_1.default, true);
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
    _options.headers.forEach(function (h, index) {
        h.depth = h.depth === undefined || h.depth !== index ? index : h.depth;
    });
    var _headers = _options.headers;
    var getHeaderRow = function (c, r) {
        return _headers.filter(function (_a) {
            var type = _a.type, x = _a.c, y = _a.r;
            return type === "row" && c >= x && r === y;
        });
    };
    var getHeaderColumn = function (c, r) {
        return _headers.filter(function (_a) {
            var type = _a.type, x = _a.c, y = _a.r;
            return type === "column" && c === x && r >= y;
        });
    };
    // Extract headers to determine data mapping and nesting
    var headers = [];
    var maxColumns = input.reduce(function (acc, row) { return Math.max(acc, row.length); }, 0);
    var maxRows = input.length;
    var startDataRIndex = Infinity;
    var startDataCIndex = Infinity;
    var _loop_1 = function (r) {
        var _loop_2 = function (c) {
            var headerRows = getHeaderRow(c, r);
            var headerColumns = getHeaderColumn(c, r);
            // Check contents exist, if so check if relevant header row/column and add entry
            var cell = (0, get_1.default)(input, [r, c]);
            if (cell !== undefined && cell !== null && cell !== "") {
                if (headerRows.length > 0) {
                    headerRows.forEach(function (h) {
                        if (!headers[h.depth])
                            headers[h.depth] = [];
                        headers[h.depth].push({
                            header: h,
                            name: (cell + "").trim(),
                            c: c,
                            r: r,
                            width: 1,
                            height: 1,
                        });
                        startDataRIndex = Math.min(startDataRIndex, r + 1);
                    });
                }
                if (headerColumns.length > 0) {
                    headerColumns.forEach(function (h) {
                        if (!headers[h.depth])
                            headers[h.depth] = [];
                        headers[h.depth].push({
                            header: h,
                            name: (cell + "").trim(),
                            c: c,
                            r: r,
                            width: 1,
                            height: 1,
                        });
                        startDataCIndex = Math.min(startDataCIndex, c + 1);
                    });
                }
            }
        };
        for (var c = 0; c < maxColumns; c++) {
            _loop_2(c);
        }
    };
    for (var r = 0; r < maxRows; r++) {
        _loop_1(r);
    }
    // Extra plugin functionality to modify the headers before
    // processing output data.
    if (typeof _options.modifyHeaders === "function") {
        _options.modifyHeaders(headers);
    }
    startDataRIndex = startDataRIndex === Infinity ? 0 : startDataRIndex;
    startDataCIndex = startDataCIndex === Infinity ? 0 : startDataCIndex;
    // Get the cell headers for a specific cell
    var getCellHeaders = function (c, r) {
        var cellHeaders = [];
        headers.forEach(function (cells, depth) {
            var _cellHeaders = cells.filter(function (h) {
                var cMin = h.c;
                var cMax = h.c + h.width;
                var rMin = h.r;
                var rMax = h.r + h.height;
                var isWithin = h.header.type === "row"
                    ? c >= cMin && c < cMax
                    : r >= rMin && r < rMax;
                return isWithin;
            });
            cellHeaders[depth] = _cellHeaders;
        });
        // Ensure to remove any empty axes
        return cellHeaders.filter(function (cells) { return cells.length; });
    };
    var addCellToCollection = function (_a) {
        var c = _a.c, r = _a.r, collection = _a.collection;
        var cell = (0, get_1.default)(input, [r, c]);
        var cellHeaders = getCellHeaders(c, r);
        // Avoid setting header values as cell values
        var setCell = true;
        for (var depth = 0; depth < cellHeaders.length; depth++) {
            for (var index = 0; index < cellHeaders[depth].length; index++) {
                var headerName = cellHeaders[depth][index].name;
                if (cell === headerName) {
                    setCell = false;
                    break;
                }
            }
            if (!setCell)
                break;
        }
        if (!setCell)
            return;
        // Make sure any nested objects exist
        var cellObjectPath = [];
        cellHeaders.forEach(function (cells, depth) {
            cells.forEach(function (h) {
                cellObjectPath[depth] = h.name;
                if (!(0, has_1.default)(collection, cellObjectPath))
                    (0, set_1.default)(collection, cellObjectPath, {});
            });
        });
        // Set the cell value
        (0, set_1.default)(collection, cellObjectPath, cell);
    };
    var entryAxis = headers[0][0].header.type;
    // Perpendicular axis (e.g. `row.column`, `column.row`) affects
    // output, whether it is array of entries, or just an object
    // with entries as props.
    var hasPerpendicularAxis = headers.length > 0 &&
        new Set(headers.map(function (headerCells) { return headerCells[0].header.type; })).size > 1;
    var output = hasPerpendicularAxis ? {} : [];
    // Entries are represented by rows, individual cells by columns
    if (entryAxis === "row") {
        for (var r = startDataRIndex; r < maxRows; r++) {
            var collection = output instanceof Array ? {} : output;
            for (var c = startDataCIndex; c < maxColumns; c++) {
                addCellToCollection({
                    c: c,
                    r: r,
                    collection: collection,
                });
            }
            if (output instanceof Array &&
                Object.keys(collection).length) {
                output.push(collection);
            }
        }
    }
    else {
        // Entries are represented by columns, individual cells by rows
        for (var c = startDataCIndex; c < maxColumns; c++) {
            var collection = output instanceof Array ? {} : output;
            for (var r = startDataRIndex; r < maxRows; r++) {
                addCellToCollection({
                    c: c,
                    r: r,
                    collection: collection,
                });
            }
            if (output instanceof Array &&
                Object.keys(collection).length) {
                output.push(collection);
            }
        }
    }
    return output;
}
exports.convertTableDataToJSON = convertTableDataToJSON;
exports.default = convertTableDataToJSON;
//# sourceMappingURL=core.js.map