import { clone } from '../../src/utilities';

describe('clone', () => {
    it('should clone a simple object', () => {
        const result = clone({ foo: "bar" });
        expect(result).toBeDefined();
        expect(result).toEqual({ foo: "bar" });
        expect(result).not.toBe({ foo: "bar" }); // Ensure it's not the same reference
    });

    it('should deeply clone a nested object', () => {
        const source = { foo: "bar", nested: { baz: 42 } };
        const result = clone(source);
        expect(result).toEqual(source);
        expect(result).not.toBe(source); // Different reference
        expect(result.nested).not.toBe(source.nested); // Nested object should also be cloned
    });

    it('should clone arrays correctly', () => {
        const source = [1, 2, 3, { foo: "bar" }];
        const result = clone(source);
        expect(result).toEqual(source);
        expect(result).not.toBe(source); // Ensure it's not the same reference
        expect(result[3]).not.toBe(source[3]); // Nested objects in arrays should also be cloned
    });

    it('should handle cloning null', () => {
        const result = clone(null);
        expect(result).toBeNull();
    });

    it('should handle cloning undefined', () => {
        const result = clone(undefined);
        expect(result).toBeUndefined();
    });

    it('should handle cloning complex objects with functions', () => {
        const source = {
            foo: "bar",
            method: function () {
                return "test";
            }
        };
        const result = clone(source);
        expect(result).toEqual(source);
        expect(result.method()).toBe("test"); // Functions should still work after cloning
    });
});
