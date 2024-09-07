import { safeEach } from '../../src/utilities';

describe('safeEach', () => {
    it('should iterate over each element of the array and apply the callback', () => {
        const callback = jest.fn();
        const items = [1, 2, 3];
        safeEach(items, callback);
        expect(callback).toHaveBeenCalledTimes(3);  // Callback should be called 3 times
        expect(callback).toHaveBeenCalledWith(1, 0);  // First call with first element and index 0
        expect(callback).toHaveBeenCalledWith(2, 1);  // Second call with second element and index 1
        expect(callback).toHaveBeenCalledWith(3, 2);  // Third call with third element and index 2
    });

    it('should do nothing if the array is empty', () => {
        const callback = jest.fn();
        safeEach([], callback);
        expect(callback).not.toHaveBeenCalled();  // Callback should not be called for an empty array
    });

    it('should iterate using a custom increment value', () => {
        const callback = jest.fn();
        const items = [1, 2, 3, 4, 5, 6];
        safeEach(items, callback, 2);  // Custom increment value of 2
        expect(callback).toHaveBeenCalledTimes(3);  // Only 3 calls: [1, 3, 5]
        expect(callback).toHaveBeenCalledWith(1, 0);  // First element and index 0
        expect(callback).toHaveBeenCalledWith(3, 2);  // Third element and index 2
        expect(callback).toHaveBeenCalledWith(5, 4);  // Fifth element and index 4
    });

    it('should apply the callback to every nth element based on custom increment', () => {
        const callback = jest.fn();
        const items = [10, 20, 30, 40, 50];
        safeEach(items, callback, 3);  // Custom increment of 3
        expect(callback).toHaveBeenCalledTimes(2);  // Callback should be called twice: [10, 40]
        expect(callback).toHaveBeenCalledWith(10, 0);  // First element
        expect(callback).toHaveBeenCalledWith(40, 3);  // Fourth element
    });
});
