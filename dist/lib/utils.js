"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptAllowedValue = exports.keepAllowedValues = void 0;
/**
 * Filter an array input and only retain values which can be kept.
 */
function keepAllowedValues(input, allowedValues) {
    if (allowedValues === void 0) { allowedValues = []; }
    return input instanceof Array &&
        input.length &&
        ((allowedValues instanceof Array && allowedValues.length) ||
            typeof allowedValues === "function")
        ? typeof allowedValues === "function"
            ? input.filter(function (i) { return allowedValues(i); })
            : input.filter(function (i) { return allowedValues.includes(i); })
        : [];
}
exports.keepAllowedValues = keepAllowedValues;
/**
 * Check an input value to see if it can be accepted.
 *
 * Returns the accepted value, or returns nothing.
 *
 * Can be configured to throw an error if required.
 */
function acceptAllowedValue(input, allowedValues, throwError) {
    if (throwError === void 0) { throwError = false; }
    if (!allowedValues ||
        !(allowedValues instanceof Array || typeof allowedValues === "function") ||
        (allowedValues instanceof Array && !allowedValues.length)) {
        throw new Error("No allowed values specified");
    }
    if (!(input instanceof Array)) {
        if ((allowedValues instanceof Array && allowedValues.includes(input)) ||
            (typeof allowedValues === "function" && allowedValues(input))) {
            return input;
        }
    }
    else {
        var accepted = keepAllowedValues(input, allowedValues);
        if (accepted.length)
            return accepted;
    }
    if (throwError) {
        if (allowedValues instanceof Array) {
            throw new Error("Invalid value given, must be one of: ".concat(allowedValues.join(", ")));
        }
        else {
            throw new Error("Invalid value given");
        }
    }
    return undefined;
}
exports.acceptAllowedValue = acceptAllowedValue;
//# sourceMappingURL=utils.js.map