import { describe, it, expect, vi } from 'vitest';
import { createReactive, runEffect, scheduleUpdate, cleanupTree } from '../../src/reactive.js';

const flush = () => new Promise(resolve => queueMicrotask(resolve));

describe('reactivity audit regressions', () => {
    it('preserves nested identities, cycles, and raw object keys', () => {
        const raw = { nested: {}, items: [] };
        raw.self = raw;
        const data = createReactive(raw);
        expect(data.nested).toBe(data.nested);
        expect(data.items).toBe(data.items);
        expect(data.self).toBe(data);
        expect(Object.keys(raw)).toEqual(['nested', 'items', 'self']);
        expect(() => Object.keys(createReactive(Object.freeze({ value: 1 })))).not.toThrow();
    });

    it('does not confuse matching property names on different objects', async () => {
        const data = createReactive({ left: { value: 1 }, right: { value: 2 } });
        const effect = vi.fn(() => data.left.value);
        runEffect(effect);
        data.right.value = 3;
        await flush();
        expect(effect).toHaveBeenCalledTimes(1);
        data.left.value = 4;
        await flush();
        expect(effect).toHaveBeenCalledTimes(2);
    });

    it('restores outer tracking after nested effects', async () => {
        const data = createReactive({ inner: 0, outer: 0 });
        const child = () => data.inner;
        const parent = vi.fn(() => {
            runEffect(child);
            return data.outer;
        });
        runEffect(parent);
        data.outer++;
        await flush();
        expect(parent).toHaveBeenCalledTimes(2);
    });

    it('unsubscribes dependencies from inactive conditional branches', async () => {
        const data = createReactive({ active: true, left: 1, right: 2 });
        const effect = vi.fn(() => data.active ? data.left : data.right);
        runEffect(effect);
        data.active = false;
        await flush();
        data.left++;
        await flush();
        expect(effect).toHaveBeenCalledTimes(2);
    });

    it('supports array symbols, iteration, deletion, and truncation', async () => {
        const data = createReactive([1, 2, 3]);
        const effect = vi.fn(() => [...data]);
        runEffect(effect);
        delete data[1];
        await flush();
        expect(effect).toHaveBeenCalledTimes(2);
        data.length = 1;
        await flush();
        expect(effect).toHaveBeenCalledTimes(3);
        expect([...data]).toEqual([1]);
    });

    it('notifies length readers when a numeric index extends an array', async () => {
        const data = createReactive([]);
        const effect = vi.fn(() => data.length);
        runEffect(effect);
        data[3] = 'new';
        await flush();
        expect(effect).toHaveLastReturnedWith(4);
    });

    it('tracks added and removed object keys', async () => {
        const data = createReactive({ first: 1 });
        const effect = vi.fn(() => Object.keys(data));
        runEffect(effect);
        data.second = 2;
        await flush();
        expect(effect).toHaveLastReturnedWith(['first', 'second']);
        delete data.first;
        await flush();
        expect(effect).toHaveLastReturnedWith(['second']);
    });

    it('does not proxy native objects with internal slots', () => {
        const data = createReactive({ date: new Date(0), map: new Map([['key', 1]]) });
        expect(data.date.getTime()).toBe(0);
        expect(data.map.get('key')).toBe(1);
    });

    it('runs every distinct batched callback exactly once', async () => {
        const first = vi.fn();
        const second = vi.fn();
        scheduleUpdate(first);
        scheduleUpdate(second);
        scheduleUpdate(first);
        await flush();
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('does not schedule callbacks when creating proxies or assigning NaN again', async () => {
        const callback = vi.fn();
        const data = createReactive({ value: NaN }, callback);
        data.value = NaN;
        await flush();
        expect(callback).not.toHaveBeenCalled();
    });

    it('disposes queued effects and element listeners during cleanup', async () => {
        const data = createReactive({ value: 0 });
        const owner = document.createElement('div');
        const cleanup = vi.fn();
        owner.__ssOnCleanup = [cleanup];
        const effect = vi.fn(() => data.value);
        runEffect(effect, owner);
        data.value++;
        cleanupTree(owner);
        await flush();
        expect(effect).toHaveBeenCalledTimes(1);
        expect(cleanup).toHaveBeenCalledTimes(1);
    });
});
