import { isEmpty } from '../../src/utilities';

describe('isEmpty', () => {
    it('should return true for empty arrays', () => {
        expect(isEmpty([])).toBe(true);  // Empty array
    });

    it('should return false for non-empty arrays', () => {
        expect(isEmpty([1, 2, 3])).toBe(false);  // Non-empty array
    });

    it('should return true for empty objects', () => {
        expect(isEmpty({})).toBe(true);  // Empty object
    });

    it('should return false for non-empty objects', () => {
        expect(isEmpty({ foo: 'bar' })).toBe(false);  // Non-empty object
    });

    it('should return true for empty strings', () => {
        expect(isEmpty('')).toBe(true);  // Empty string
    });

    it('should return false for non-empty strings', () => {
        expect(isEmpty('hello')).toBe(false);  // Non-empty string
    });

    it('should return true for null', () => {
        expect(isEmpty(null)).toBe(true);  // Null value
    });

    it('should return true for undefined', () => {
        expect(isEmpty(undefined)).toBe(true);  // Undefined value
    });

    it('should return true for numbers (as they are not considered collections)', () => {
        expect(isEmpty(0)).toBe(true);    // Number 0
        expect(isEmpty(42)).toBe(true);   // Non-zero number
    });

    it('should return true for booleans (as they are not considered collections)', () => {
        expect(isEmpty(true)).toBe(true);   // Boolean true
        expect(isEmpty(false)).toBe(true);  // Boolean false
    });
});
