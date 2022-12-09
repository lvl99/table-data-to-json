export declare type AllowedValue = string | number | boolean | null | undefined;
export declare type CheckAllowedValueFn<T = AllowedValue> = (input: T) => boolean;
/**
 * Filter an array input and only retain values which can be kept.
 */
export declare function keepAllowedValues<T = AllowedValue>(input: T[], allowedValues?: T[] | CheckAllowedValueFn<T>): T[];
/**
 * Check an input value to see if it can be accepted.
 *
 * Returns the accepted value, or returns nothing.
 *
 * Can be configured to throw an error if required.
 */
export declare function acceptAllowedValue<T = AllowedValue>(input: T | T[], allowedValues: T[] | CheckAllowedValueFn<T>, throwError?: boolean): T | T[] | undefined;
