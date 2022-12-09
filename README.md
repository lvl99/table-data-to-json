# Table Data to JSON

Convert data which is in an array table format to a JSON object:

Imagine a table:

| a   | b   | c   |
| --- | --- | --- |
| 1   | 2   | 3   |
| do  | re  | mi  |

Would be represented as table data like so:

```json
[
  ["a", "b", "c"],
  [1, 2, 3],
  ["do", "re", "mi"]
]
```

If the first row is the header (X axis), then the output JSON
would look like this:

```json
[
  {
    "a": 1,
    "b": 2,
    "c": 3
  },
  {
    "a": "do"
    "b": "re",
    "c": "mi"
  }
]
```

If the first column (Y axis) is the header, then the output
JSON would look like this:

```json
[
  {
    "a": "b",
    "1": 2,
    "do": "re"
  },
  {
    "a": "c",
    "1": 3,
    "do": "mi"
  }
]
```

You can even output an object with multiple headers mapped as nested properties, like so:

|           | Tom | Dick | Harriette |
| --------- | --- | ---- | --------- |
| _Age_     | 24  | 32   | 40        |
| _Country_ | NZ  | AU   | FR        |

```js
const input = [
  ["", "Tom", "Dick", "Harriette"],
  ["Age", 24, 32, 40],
  ["Country", "NZ", "AU", "FR"],
];

const output = convertTableDataToJSON(input, {
  preset: "row.column",
});

/*
{
  "Tom": {
    "Age": 24,
    "Country": "NZ"
  },
  "Dick": {
    "Age": 24,
    "Country": "AU"
  },
  "Harriette": {
    "Age": 40,
    "Country": "FR"
  }
}
*/
```

## Installation

```sh
  npm i table-data-to-json
  yarn add table-data-to-json
```

## Usage

Import and use `convertTableDataToJSON()` within your project like so:

```js
import convertTableDataToJSON from "table-data-to-json";

const output = convertTableDataToJSON(
  [
    ["a", "b", "c"],
    [1, 2, 3],
    ["do", "re", "mi"],
  ],
  {
    preset: "row",
  }
);
```

### Options

| Property  | Type                                           | Description                                                                                                          |
| --------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `preset`  | String                                         | Accepted values:<ul><li>`row`</li><li>`column`</li><li>`row.column`</li><li>`column.row`</li><li>`row.row`</li></ul> |
| `headers` | [`TableDataConfigHeaders`](lib/core.ts#L26:32) | In case the presets don't cover your use-case, you can specify the headers here.                                     |

### Want to convert CSV and TSV data?

You can use other libraries like [csv-parse](https://www.npmjs.com/package/csv-parse) to convert your CSV file/data to the array table data format, then run `convertTableDataToJSON()`.

### Want to convert XLSX data?

Use sister package [xlsx-table-data-to-json](https://www.npmjs.com/package/xlsx-table-data-to-json) which has some additional config and methods to handle sheets and convert cell data to usable formats.

This package uses [xlsx](https://www.npmjs.com/package/xlsx) to handle XLSX and CSV files/data.

## Development

To download external dependencies:

```sh
  npm i
```

To run tests (using Jest):

```sh
  npm test
  npm run test:watch
```

## Contribute

Got cool ideas? Have questions or feedback? Found a bug? [Post an issue](https://github.com/lvl99/table-data-to-json/issues)

Added a feature? Fixed a bug? [Post a PR](https://github.com/lvl99/table-data-to-json/compare)

## License

[Apache 2.0](LICENSE.md)
