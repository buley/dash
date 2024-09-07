import { isRegEx } from '../../src/utilities';

describe('isRegEx', () => {
    it('should return true for regular expressions', () => {
        expect(isRegEx(/abc/)).toBe(true);             // Regular expression literal
        expect(isRegEx(new RegExp('abc'))).toBe(true); // RegExp object
    });

    it('should return false for strings', () => {
        expect(isRegEx('abc')).toBe(false);            // String
    });

    it('should return false for objects', () => {
        expect(isRegEx({ foo: 'bar' })).toBe(false);   // Object
    });

    it('should return false for arrays', () => {
        expect(isRegEx([1, 2, 3])).toBe(false);        // Array
    });

    it('should return false for numbers', () => {
        expect(isRegEx(123)).toBe(false);              // Number
    });

    it('should return false for functions', () => {
        expect(isRegEx(() => {})).toBe(false);         // Function
    });

    it('should return false for null and undefined', () => {
        expect(isRegEx(null)).toBe(false);             // Null
        expect(isRegEx(undefined)).toBe(false);        // Undefined
    });
});
