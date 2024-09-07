import behaviorMethods from './../../src/behaviors';
import { DashContext } from './../../src/utilities';

// Mock the behavior context functions
jest.mock('./../../src/utilities', () => ({
    cloneError: jest.fn(),
    safeApply: jest.fn(),
    safeEach: jest.fn((array, fn) => array.forEach(fn)),
}));

describe('behaviorMethods', () => {
    let mockRequest: any;
    
    beforeEach(() => {
        // Clear behavior actions and filters to avoid shared state between tests
        behaviorMethods.behaviorFilters.length = 0;
        behaviorMethods.behaviorActions.length = 0;

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    beforeEach(() => {
        mockRequest = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            result: 'testResult',
            error: new Error('Test Error'),
        };
    });

    describe('get', () => {
        it('should retrieve all behaviors', async () => {
            const get_ctx: DashContext = {
                objectstore: {
                    indexNames: ['behavior1', 'behavior2'],
                } as unknown as IDBObjectStore,
                on_success: jest.fn(),
            };
        
            // Mock safeApply to call the on_success without using the spread operator
            const safeApply = require('./../../src/utilities').safeApply;
            safeApply.mockImplementation((callback: (arg0: any) => any, args: any[]) => callback(args[0]));
        
            const result = await behaviorMethods.get(get_ctx);
        
            expect(get_ctx.behaviors).toEqual(['behavior1', 'behavior2']);
            expect(get_ctx.on_success).toHaveBeenCalledWith(get_ctx);  // Check if on_success is called correctly
        });
        

        it('should handle errors during retrieval', async () => {
            const get_ctx: DashContext = {
                objectstore: {
                    indexNames: null,  // Simulate an error
                } as unknown as IDBObjectStore,
                on_error: jest.fn(),
            };
        
            // Mock cloneError to return a proper error object
            const cloneError = require('./../../src/utilities').cloneError;
            cloneError.mockImplementation((error: Error) => ({ message: 'Test Error' }));
        
            // Mock safeApply to call the on_error callback
            const safeApply = require('./../../src/utilities').safeApply;
            safeApply.mockImplementation((callback: (arg0: any) => any, args: any[]) => callback(args[0]));
        
            await expect(behaviorMethods.get(get_ctx)).rejects.toEqual(get_ctx);
            expect(get_ctx.error).toBeDefined();  // Check if error is set
            expect(get_ctx.error.message).toBe('Test Error');  // Check error message
            expect(get_ctx.on_error).toHaveBeenCalledWith(get_ctx);  // Ensure on_error is called
        });
        
        
    });

    describe('add', () => {
        it('should add a behavior action', () => {
            const mockFilter = jest.fn();
            const mockAction = jest.fn();

            behaviorMethods.add([mockFilter, mockAction]);

            // Ensure the filter and action are added to the internal lists
            expect(behaviorMethods.behaviorFilters).toContain(mockFilter);
            expect(behaviorMethods.behaviorActions).toContain(mockAction);
        });
    });

    describe('applyBehaviors', () => {
        it('should apply all behavior actions', async () => {
            const mockAction = jest.fn(() => ({ context: { objectstore: {} }, type: 'testSlug' }));  // Return the correct structure
            const ctx: DashContext = { objectstore: {} } as DashContext;
        
            const safeApply = require('./../../src/utilities').safeApply;
            safeApply.mockImplementation((action: (arg0: any) => any, args: any) => action(args[0]));  // Pass the context directly
        
            behaviorMethods.add(mockAction);
        
            const finalContext = await behaviorMethods.applyBehaviors(ctx, 'testSlug', 'testMethod', Promise.resolve(ctx));
        
            expect(mockAction).toHaveBeenCalled();
            expect(finalContext).toStrictEqual(ctx);  // Use toStrictEqual for deep equality check
        });

        it('should handle errors during action application', async () => {
            const mockAction = jest.fn(() => {
                throw new Error('Test Error');
            });
            const ctx: DashContext = { objectstore: {} } as DashContext;
        
            const safeApply = require('./../../src/utilities').safeApply;
            safeApply.mockImplementation(() => {
                throw new Error('Test Error');
            });
        
            behaviorMethods.add(mockAction);
        
            await expect(behaviorMethods.applyBehaviors(ctx, 'testSlug', 'testMethod', Promise.resolve(ctx))).rejects.toThrow('Test Error');
        });
        
    });
});
