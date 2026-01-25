/**
 * Tests for the reactive system
 * @module tests/reactive
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createReactive, runEffect, scheduleUpdate, pendingEffects } from '../../src/reactive.js';

describe('createReactive', () => {
    it('creates a reactive proxy from an object', () => {
        const data = { count: 0 };
        const reactive = createReactive(data, () => {});
        
        expect(reactive.count).toBe(0);
        expect(reactive.__isReactive).toBe(true);
    });

    it('creates a reactive proxy from an array', () => {
        const data = [1, 2, 3];
        const reactive = createReactive(data, () => {});
        
        expect(reactive.length).toBe(3);
        expect(reactive[0]).toBe(1);
    });

    it('triggers update callback on property change', async () => {
        const onUpdate = vi.fn();
        const reactive = createReactive({ count: 0 }, onUpdate);
        
        reactive.count = 1;
        
        // Wait for microtask queue
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(onUpdate).toHaveBeenCalled();
    });

    it('does not trigger update if value is unchanged', async () => {
        const onUpdate = vi.fn();
        const reactive = createReactive({ count: 5 }, onUpdate);
        
        // First access to trigger any initial setup
        await new Promise(resolve => queueMicrotask(resolve));
        onUpdate.mockClear(); // Reset after any initial calls
        
        reactive.count = 5; // Set to same value
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('handles nested objects reactively', async () => {
        const onUpdate = vi.fn();
        const reactive = createReactive({ user: { name: 'John' } }, onUpdate);
        
        reactive.user.name = 'Jane';
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(onUpdate).toHaveBeenCalled();
    });

    it('handles array push mutation', async () => {
        const onUpdate = vi.fn();
        const reactive = createReactive({ items: [1, 2] }, onUpdate);
        
        reactive.items.push(3);
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(reactive.items.length).toBe(3);
        expect(onUpdate).toHaveBeenCalled();
    });

    it('handles array splice mutation', async () => {
        const onUpdate = vi.fn();
        const reactive = createReactive({ items: [1, 2, 3] }, onUpdate);
        
        reactive.items.splice(1, 1);
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(reactive.items).toEqual([1, 3]);
        expect(onUpdate).toHaveBeenCalled();
    });

    it('handles property deletion', async () => {
        const onUpdate = vi.fn();
        const reactive = createReactive({ a: 1, b: 2 }, onUpdate);
        
        delete reactive.b;
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(reactive.b).toBeUndefined();
        expect(onUpdate).toHaveBeenCalled();
    });
});

describe('runEffect', () => {
    it('executes the effect function', () => {
        const effect = vi.fn();
        runEffect(effect);
        
        expect(effect).toHaveBeenCalledOnce();
    });

    it('tracks dependencies during execution', () => {
        const reactive = createReactive({ count: 0 }, () => {});
        let captured = null;
        
        runEffect(() => {
            captured = reactive.count;
        });
        
        expect(captured).toBe(0);
        expect(reactive.__subscribers.has('count')).toBe(true);
    });
});

describe('scheduleUpdate', () => {
    it('batches multiple updates into single callback', async () => {
        const callback = vi.fn();
        
        scheduleUpdate(callback);
        scheduleUpdate(callback);
        scheduleUpdate(callback);
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        // Should only be called once due to batching
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
