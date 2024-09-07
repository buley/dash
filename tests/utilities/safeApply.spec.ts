import { safeApply } from '../../src/utilities';

describe('safeApply', () => {
    it('should invoke the provided function with given arguments', () => {
        const fn = jest.fn();
        const args = [1, 2, 3];
        const result = safeApply(fn, args);
        expect(fn).toHaveBeenCalledWith(...args);  // The function should be called with the correct arguments
        expect(result).toBeUndefined();            // No return value, so should be undefined
    });


    it('should apply the function with a specific context', () => {
        interface Context {
            value: number;
        }

        // Use explicit typing for `this`
        const fn = function (this: Context) {
            return this.value;
        };

        const context = { value: 42 };
        const result = safeApply(fn, [], context);
        expect(result).toBe(42);  // The function should use the provided context
    });

    it('should return undefined if no function is provided', () => {
        const result = safeApply(undefined, [1, 2, 3]);
        expect(result).toBeUndefined();            // Should safely return undefined when no function is provided
    });

    it('should call the error handler if the main function is undefined', () => {
        const errorHandler = jest.fn();
        safeApply(undefined, [], undefined, errorHandler);
        expect(errorHandler).toHaveBeenCalled();   // Error handler should be invoked
    });

    it('should return undefined if both the main function and error handler are undefined', () => {
        const result = safeApply(undefined, []);
        expect(result).toBeUndefined();            // Should return undefined in absence of both main function and error handler
    });

    it('should pass arguments to the error handler', () => {
        const errorHandler = jest.fn();
        safeApply(undefined, [], undefined, errorHandler);
        expect(errorHandler).toHaveBeenCalledWith();  // Error handler should be called with no arguments in this case
    });
});
