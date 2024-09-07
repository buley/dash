import { isnt } from '../../src/utilities';

describe('isnt', () => {
    it('should return true for different primitive values', () => {
        expect(isnt(42, '42')).toBe(true);         // Number vs string
        expect(isnt(42, 43)).toBe(true);           // Different numbers
        expect(isnt('hello', 'world')).toBe(true); // Different strings
        expect(isnt(true, false)).toBe(true);      // Different booleans
    });

    it('should return false for identical primitive values', () => {
        expect(isnt(42, 42)).toBe(false);          // Same numbers
        expect(isnt('hello', 'hello')).toBe(false); // Same strings
        expect(isnt(true, true)).toBe(false);      // Same booleans
    });

    it('should return true for different objects (reference equality)', () => {
        const obj1 = { foo: 'bar' };
        const obj2 = { foo: 'bar' };
        expect(isnt(obj1, obj2)).toBe(true);       // Different references, even if the structure is the same
    });

    it('should return false for the same object reference', () => {
        const obj = { foo: 'bar' };
        expect(isnt(obj, obj)).toBe(false);        // Same object reference
    });

    it('should return true for different arrays (reference equality)', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        expect(isnt(arr1, arr2)).toBe(true);       // Different array instances
    });

    it('should return false for the same array reference', () => {
        const arr = [1, 2, 3];
        expect(isnt(arr, arr)).toBe(false);        // Same array reference
    });

    it('should return true for null vs undefined', () => {
        expect(isnt(null, undefined)).toBe(true);  // Null vs undefined
    });

    it('should return false for two null values', () => {
        expect(isnt(null, null)).toBe(false);      // Both are null
    });

    it('should return true for defined vs undefined values', () => {
        expect(isnt(42, undefined)).toBe(true);    // Defined number vs undefined
    });
});
