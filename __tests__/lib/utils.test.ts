import {
  AllowedValue,
  acceptAllowedValue,
  keepAllowedValues,
} from "../../lib/utils";

describe("keepAllowedValues", () => {
  it("should keep allowed values when provided as array", () => {
    const result = keepAllowedValues([1, 2, 3], [1, 3]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(3);
  });

  it("should keep allowed values when provided as function", () => {
    const result = keepAllowedValues(
      [1, 2, 3],
      (x: number): boolean => !(x % 2)
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(2);
  });

  it("should return an empty array if no allowed values found to keep", () => {
    const result = keepAllowedValues([1, 2, 3], [0]);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  it("should return an empty array if input or allowed values is empty", () => {
    expect(keepAllowedValues([1], undefined)).toHaveLength(0);
    expect(keepAllowedValues([1], [])).toHaveLength(0);
    expect(keepAllowedValues([], [])).toHaveLength(0);
  });
});

describe("acceptAllowedValue", () => {
  it("should accept single allowed value when comparing to array", () => {
    expect(acceptAllowedValue(1, [1, 2, 3])).toBe(1);
    expect(acceptAllowedValue("b", ["a", "b", "c"])).toBe("b");
    expect(acceptAllowedValue(undefined, [undefined, 1, 2])).toBe(undefined);
    expect(acceptAllowedValue(null, [null, 1, 2])).toBe(null);
    expect(acceptAllowedValue(false, [true, false])).toBe(false);
  });

  it("should accept multiple allowed values when comparing to array", () => {
    expect(acceptAllowedValue([1, 3], [1, 2, 3])).toEqual(
      expect.arrayContaining([1, 3])
    );
    expect(acceptAllowedValue(["b", "a"], ["a", "b", "c"])).toEqual(
      expect.arrayContaining(["b", "a"])
    );
    expect(
      acceptAllowedValue([null, undefined, false, 0], [undefined, 0])
    ).toEqual(expect.arrayContaining([undefined, 0]));
    expect(
      acceptAllowedValue([null, undefined, false, 0], [null, 1, 2])
    ).toEqual([null]);
    expect(
      acceptAllowedValue([null, undefined, false, 0], [true, false])
    ).toEqual([false]);
  });

  it("should accept single allowed value when comparing to function", () => {
    const testAllowed: AllowedValue[] = [1, "b", undefined, null, false];
    const testAllowedFn = (x: AllowedValue): boolean => testAllowed.includes(x);
    expect(acceptAllowedValue(1, testAllowedFn)).toBe(1);
    expect(acceptAllowedValue("b", testAllowedFn)).toBe("b");
    expect(acceptAllowedValue(undefined, testAllowedFn)).toBe(undefined);
    expect(acceptAllowedValue(null, testAllowedFn)).toBe(null);
    expect(acceptAllowedValue(false, testAllowedFn)).toBe(false);
  });

  it("should return undefined if no matches made", () => {
    expect(acceptAllowedValue(1, [0])).toBeUndefined();
    expect(acceptAllowedValue(1, () => false)).toBeUndefined();
  });

  it("should throw an error if no allowed values specified", () => {
    expect(() => acceptAllowedValue(1, [], true)).toThrowError(
      "No allowed values specified"
    );
  });

  it("should throw an error if invalid value given when allowed values is provided as array", () => {
    expect(() => acceptAllowedValue(1, [0], true)).toThrowError(
      "Invalid value given, must be one of: 0"
    );
  });

  it("should throw an error if invalid value given when allowed values is provided as function", () => {
    expect(() => acceptAllowedValue(1, () => false, true)).toThrowError(
      "Invalid value given"
    );
  });
});
