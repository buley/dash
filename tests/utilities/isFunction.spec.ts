import { isFunction } from '../../src/utilities';

describe('isFunction', () => {
    it('should return true for actual functions', () => {
        expect(isFunction(function() {})).toBe(true);  // Regular function
        expect(isFunction(() => {})).toBe(true);       // Arrow function
        expect(isFunction(async () => {})).toBe(true); // Async function
        expect(isFunction(function*() {})).toBe(true); // Generator function
    });

    it('should return false for class declarations', () => {
        class MyClass {}
        expect(isFunction(MyClass)).toBe(false);       // Class declaration should return false
    });

    it('should return false for function-like objects', () => {
        const functionLike = { apply: () => {}, call: () => {} };
        expect(isFunction(functionLike)).toBe(false);  // Function-like object
    });

    it('should return false for non-function values', () => {
        expect(isFunction('string')).toBe(false);      // String
        expect(isFunction(42)).toBe(false);            // Number
        expect(isFunction({})).toBe(false);            // Object
        expect(isFunction([])).toBe(false);            // Array
        expect(isFunction(true)).toBe(false);          // Boolean
        expect(isFunction(null)).toBe(false);          // Null
        expect(isFunction(undefined)).toBe(false);     // Undefined
    });
});
