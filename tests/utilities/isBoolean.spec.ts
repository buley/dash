import { isBoolean } from '../../src/utilities';

describe('isBoolean', () => {
    it('should return true for boolean values', () => {
        expect(isBoolean(true)).toBe(true);   // Boolean true
        expect(isBoolean(false)).toBe(true);  // Boolean false
    });

    it('should return false for non-boolean values', () => {
        expect(isBoolean('true')).toBe(false);  // String
        expect(isBoolean(0)).toBe(false);       // Number
        expect(isBoolean(1)).toBe(false);       // Number
        expect(isBoolean([])).toBe(false);      // Array
        expect(isBoolean({})).toBe(false);      // Object
        expect(isBoolean(null)).toBe(false);    // null
        expect(isBoolean(undefined)).toBe(false); // undefined
    });

    it('should return false for boolean-like strings', () => {
        expect(isBoolean('false')).toBe(false);  // String "false"
        expect(isBoolean('true')).toBe(false);   // String "true"
    });
});
