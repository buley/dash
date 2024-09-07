import { cloneError } from '../../src/utilities';

describe('cloneError', () => {
    it('should create a deep clone of an error object', () => {
        const source = new Error('test');
        const result = cloneError(source);
        
        // Check that the result is defined and an instance of Error
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Error);
        
        // Ensure the cloned error has the same message and properties
        expect(result.message).toBe(source.message);
        
        // Optionally verify the stack if it's available
        if (source.stack) {
            expect(result.stack).toBe(source.stack);  // Stack should be the same
        }

        // Ensure the result is a new object, not just a reference to the original
        expect(result).not.toBe(source);
    });

    it('should handle custom error properties', () => {
        const source = new Error('test') as any;
        source.customProp = 'customValue';
        const result = cloneError(source);

        // Ensure the custom properties are cloned as well
        expect((result as any).customProp).toBe(source.customProp);
        expect(result).not.toBe(source);  // Verify it's a new object
    });
});
