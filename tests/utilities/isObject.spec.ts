import { isObject } from '../../src/utilities';

describe('isObject', () => {
    it('should return true for plain objects', () => {
        expect(isObject({})).toBe(true);           // Plain object
        expect(isObject({ foo: 'bar' })).toBe(true); // Object with properties
    });

    it('should return false for arrays', () => {
        expect(isObject([1, 2, 3])).toBe(false);   // Array
        expect(isObject([])).toBe(false);          // Empty array
    });

    it('should return false for functions', () => {
        expect(isObject(function() {})).toBe(false);  // Regular function
        expect(isObject(() => {})).toBe(false);       // Arrow function
    });

    it('should return false for special objects like Date', () => {
        expect(isObject(new Date())).toBe(false);   // Date object
    });

    it('should return false for special objects like RegExp', () => {
        expect(isObject(/regex/)).toBe(false);      // RegExp object
    });

    it('should return false for number objects', () => {
        expect(isObject(new Number(42))).toBe(false); // Number object
    });

    it('should return false for string objects', () => {
        expect(isObject(new String('hello'))).toBe(false); // String object
    });

    it('should return false for non-object types', () => {
        expect(isObject(42)).toBe(false);           // Number
        expect(isObject('hello')).toBe(false);      // String
        expect(isObject(true)).toBe(false);         // Boolean
        expect(isObject(null)).toBe(false);         // Null
        expect(isObject(undefined)).toBe(false);    // Undefined
    });
});
