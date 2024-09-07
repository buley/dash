import { safeIterate } from '../../src/utilities';

describe('safeIterate', () => {
    it('should iterate over an object’s properties and apply the callback', () => {
        const callback = jest.fn();
        const obj = { foo: 'bar', baz: 42 };
        safeIterate(obj, callback);

        expect(callback).toHaveBeenCalledTimes(2);  // Callback should be called twice
        expect(callback).toHaveBeenCalledWith('foo', 'bar');  // First key-value pair
        expect(callback).toHaveBeenCalledWith('baz', 42);     // Second key-value pair
    });

    it('should not call the callback for an empty object', () => {
        const callback = jest.fn();
        safeIterate({}, callback);

        expect(callback).not.toHaveBeenCalled();  // Callback should not be called for an empty object
    });

    it('should not iterate over properties in the prototype chain', () => {
        const callback = jest.fn();
        const proto = { inheritedProp: 'should not iterate' };
        const obj = Object.create(proto);
        obj.ownProp = 'should iterate';

        safeIterate(obj, callback);
        
        expect(callback).toHaveBeenCalledTimes(1);  // Only own property should be iterated over
        expect(callback).toHaveBeenCalledWith('ownProp', 'should iterate');
        expect(callback).not.toHaveBeenCalledWith('inheritedProp', 'should not iterate');  // Inherited property should not be iterated over
    });

    it('should iterate over non-enumerable properties if they are explicitly defined as enumerable', () => {
        const callback = jest.fn();
        const obj = {};
        Object.defineProperty(obj, 'foo', {
            value: 'bar',
            enumerable: true,
        });

        safeIterate(obj, callback);

        expect(callback).toHaveBeenCalledTimes(1);  // Non-enumerable properties should be skipped unless explicitly enumerable
        expect(callback).toHaveBeenCalledWith('foo', 'bar');
    });
});
