import { is } from '../../src/utilities';

describe('is', () => {
    it('should return true for identical primitive values', () => {
        expect(is(42, 42)).toBe(true);           // number
        expect(is('hello', 'hello')).toBe(true); // string
        expect(is(true, true)).toBe(true);       // boolean
    });

    it('should return true for objects with the same reference', () => {
        const obj = { foo: 'bar' };
        expect(is(obj, obj)).toBe(true);         // Same reference
    });

    it('should return false for different objects even if they have the same structure', () => {
        const obj1 = { foo: 'bar' };
        const obj2 = { foo: 'bar' };
        expect(is(obj1, obj2)).toBe(false);      // Different references
    });

    it('should return true for identical arrays (by reference)', () => {
        const arr = [1, 2, 3];
        expect(is(arr, arr)).toBe(true);         // Same array reference
    });

    it('should return false for different arrays with the same elements', () => {
        expect(is([1, 2, 3], [1, 2, 3])).toBe(false); // Different array instances
    });

    it('should return true for null values compared to null', () => {
        expect(is(null, null)).toBe(true);       // null values
    });

    it('should return false when comparing null with undefined', () => {
        expect(is(null, undefined)).toBe(false); // null vs undefined
    });
});
