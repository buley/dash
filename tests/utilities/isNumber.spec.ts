import { isNumber } from '../../src/utilities';

describe('isNumber', () => {
    it('should return true for valid numbers', () => {
        expect(isNumber(42)).toBe(true);            // Integer
        expect(isNumber(3.14)).toBe(true);          // Float
        expect(isNumber(0)).toBe(true);             // Zero
        expect(isNumber(-100)).toBe(true);          // Negative number
    });

    it('should return true for special number values', () => {
        expect(isNumber(NaN)).toBe(true);           // NaN is technically a number in JavaScript
        expect(isNumber(Infinity)).toBe(true);      // Positive infinity
        expect(isNumber(-Infinity)).toBe(true);     // Negative infinity
    });

    it('should return false for non-number types', () => {
        expect(isNumber('42')).toBe(false);         // String
        expect(isNumber(true)).toBe(false);         // Boolean
        expect(isNumber([])).toBe(false);           // Array
        expect(isNumber({})).toBe(false);           // Object
        expect(isNumber(null)).toBe(false);         // Null
        expect(isNumber(undefined)).toBe(false);    // Undefined
    });

    it('should return false for number-like strings', () => {
        expect(isNumber('123')).toBe(false);        // String that looks like a number
    });
});
