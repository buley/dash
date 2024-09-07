import { isString } from '../../src/utilities';

describe('isString', () => {
    it('should return true for string literals', () => {
        expect(isString('hello')).toBe(true);      // String literal
        expect(isString('')).toBe(true);           // Empty string
    });

    it('should return true for string objects', () => {
        expect(isString(new String('hello'))).toBe(true);  // String object
    });

    it('should return false for non-string values', () => {
        expect(isString(123)).toBe(false);         // Number
        expect(isString(true)).toBe(false);        // Boolean
        expect(isString([])).toBe(false);          // Array
        expect(isString({})).toBe(false);          // Object
        expect(isString(null)).toBe(false);        // Null
        expect(isString(undefined)).toBe(false);   // Undefined
    });

    it('should return false for functions', () => {
        expect(isString(() => {})).toBe(false);    // Function
    });
});
