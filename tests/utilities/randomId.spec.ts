import { randomId } from '../../src/utilities';

describe('randomId', () => {
    it('should return a string of default length (16)', () => {
        const result = randomId();
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBe(16);  // Default length is 16
    });

    it('should return a string of specified length', () => {
        const result = randomId(8);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBe(8);  // Custom length
    });

    it('should generate different random strings for each call', () => {
        const result1 = randomId();
        const result2 = randomId();
        expect(result1).not.toBe(result2);  // Each call should return a different string
    });

    it('should only contain characters from the specified character set', () => {
        const charset = 'ABCDEF123456';
        const result = randomId(12, charset);
        expect(result.length).toBe(12);
        
        // Ensure every character in the result is part of the charset
        for (const char of result) {
            expect(charset.includes(char)).toBe(true);
        }
    });

    it('should handle an empty charset by not generating any characters', () => {
        const result = randomId(10, '');
        expect(result.length).toBe(0);  // No characters should be generated when charset is empty
    });
});
