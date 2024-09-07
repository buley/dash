import { exists } from '../../src/utilities';

describe('exists', () => {
    it('should return true for defined values', () => {
        expect(exists(42)).toBe(true);          // number
        expect(exists('hello')).toBe(true);     // non-empty string
        expect(exists({})).toBe(true);          // object
        expect(exists([])).toBe(true);          // array
        expect(exists(false)).toBe(true);       // boolean false
        expect(exists(0)).toBe(true);           // number 0
    });

    it('should return false for undefined or null values', () => {
        expect(exists(undefined)).toBe(false);  // undefined
        expect(exists(null)).toBe(false);       // null
    });

    it('should return true for empty string', () => {
        expect(exists('')).toBe(true);          // empty string is still a defined value
    });
});
