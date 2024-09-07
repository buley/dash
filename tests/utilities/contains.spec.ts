import { contains } from '../../src/utilities';

describe('contains', () => {
    it('should return true if the substring exists in the string', () => {
        const result = contains('hello world', 'world');
        expect(result).toBe(true);
    });

    it('should return false if the substring does not exist in the string', () => {
        const result = contains('hello world', 'moon');
        expect(result).toBe(false);
    });

    it('should return false when the main string is empty', () => {
        const result = contains('', 'hello');
        expect(result).toBe(false);
    });

    it('should return true when the substring is empty', () => {
        const result = contains('hello world', '');
        expect(result).toBe(true); // An empty substring is technically in any string
    });

    it('should handle case sensitivity properly', () => {
        const result = contains('hello world', 'World');
        expect(result).toBe(false); // Case-sensitive
    });
});
