export type AllowedValue = string | number | boolean | null | undefined;
export type CheckAllowedValueFn<T = AllowedValue> = (input: T) => boolean;

/**
 * Filter an array input and only retain values which can be kept.
 */
export function keepAllowedValues<T = AllowedValue>(
  input: T[],
  allowedValues: T[] | CheckAllowedValueFn<T> = []
): T[] {
  return input instanceof Array &&
    input.length &&
    ((allowedValues instanceof Array && allowedValues.length) ||
      typeof allowedValues === "function")
    ? typeof allowedValues === "function"
      ? input.filter((i) => allowedValues(i))
      : input.filter((i) => allowedValues.includes(i))
    : [];
}

/**
 * Check an input value to see if it can be accepted.
 *
 * Returns the accepted value, or returns nothing.
 *
 * Can be configured to throw an error if required.
 */
export function acceptAllowedValue<T = AllowedValue>(
  input: T | T[],
  allowedValues: T[] | CheckAllowedValueFn<T>,
  throwError = false
): T | T[] | undefined {
  if (
    !allowedValues ||
    !(allowedValues instanceof Array || typeof allowedValues === "function") ||
    (allowedValues instanceof Array && !allowedValues.length)
  ) {
    throw new Error("No allowed values specified");
  }

  if (!(input instanceof Array)) {
    if (
      (allowedValues instanceof Array && allowedValues.includes(input)) ||
      (typeof allowedValues === "function" && allowedValues(input))
    ) {
      return input;
    }
  } else {
    const accepted = keepAllowedValues<T>(input, allowedValues);
    if (accepted.length) return accepted;
  }

  if (throwError) {
    if (allowedValues instanceof Array) {
      throw new Error(
        `Invalid value given, must be one of: ${allowedValues.join(", ")}`
      );
    } else {
      throw new Error("Invalid value given");
    }
  }

  return undefined;
}
