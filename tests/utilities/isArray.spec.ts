import { isArray } from '../../src/utilities';

describe('isArray', () => {
    it('should return true for arrays', () => {
        expect(isArray([1, 2, 3])).toBe(true);     // Simple array
        expect(isArray([])).toBe(true);            // Empty array
    });

    it('should return false for non-array types', () => {
        expect(isArray('hello')).toBe(false);      // String
        expect(isArray(42)).toBe(false);           // Number
        expect(isArray({ foo: 'bar' })).toBe(false); // Object
        expect(isArray(null)).toBe(false);         // null
        expect(isArray(undefined)).toBe(false);    // undefined
    });

    it('should return false for array-like objects', () => {
        const arrayLike = { length: 2, 0: 'a', 1: 'b' };
        expect(isArray(arrayLike)).toBe(false);    // Array-like object but not an actual array
    });
});
