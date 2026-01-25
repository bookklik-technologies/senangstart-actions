/**
 * Tests for expression evaluator
 * @module tests/evaluator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEvaluator, createExecutor } from '../../src/evaluator.js';
import { createReactive } from '../../src/reactive.js';

// Helper to create a mock scope
function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

describe('createEvaluator', () => {
    it('evaluates simple expressions', () => {
        const scope = createMockScope({ count: 5 });
        const el = document.createElement('div');
        
        const evaluate = createEvaluator('count + 1', scope, el);
        expect(evaluate()).toBe(6);
    });

    it('evaluates string expressions', () => {
        const scope = createMockScope({ name: 'World' });
        const el = document.createElement('div');
        
        const evaluate = createEvaluator('"Hello, " + name', scope, el);
        expect(evaluate()).toBe('Hello, World');
    });

    it('evaluates boolean expressions', () => {
        const scope = createMockScope({ open: false });
        const el = document.createElement('div');
        
        const evaluate = createEvaluator('!open', scope, el);
        expect(evaluate()).toBe(true);
    });

    it('evaluates ternary expressions', () => {
        const scope = createMockScope({ active: true });
        const el = document.createElement('div');
        
        const evaluate = createEvaluator("active ? 'yes' : 'no'", scope, el);
        expect(evaluate()).toBe('yes');
    });

    it('returns undefined for invalid expressions', () => {
        const scope = createMockScope({});
        const el = document.createElement('div');
        
        // Invalid syntax - missing operand
        const evaluate = createEvaluator('count +', scope, el);
        expect(evaluate()).toBeUndefined();
    });
});

describe('Magic Properties', () => {
    it('$data references the reactive data object', () => {
        const scope = createMockScope({ count: 10 });
        const el = document.createElement('div');
        
        const evaluate = createEvaluator('$data.count', scope, el);
        expect(evaluate()).toBe(10);
    });

    it('$el references the current element', () => {
        const scope = createMockScope({});
        const el = document.createElement('div');
        el.id = 'test-element';
        
        const evaluate = createEvaluator('$el.id', scope, el);
        expect(evaluate()).toBe('test-element');
    });

    it('$my is an alias for $el', () => {
        const scope = createMockScope({});
        const el = document.createElement('span');
        el.className = 'test-class';
        
        const evaluate = createEvaluator('$my.className', scope, el);
        expect(evaluate()).toBe('test-class');
    });

    it('$refs contains registered refs', () => {
        const scope = createMockScope({});
        const input = document.createElement('input');
        scope.$refs.myInput = input;
        
        const el = document.createElement('div');
        const evaluate = createEvaluator('$refs.myInput.tagName', scope, el);
        expect(evaluate()).toBe('INPUT');
    });

    it('$store accesses global store', () => {
        const scope = createMockScope({});
        scope.$store = { site: { title: 'My Site' } };
        
        const el = document.createElement('div');
        const evaluate = createEvaluator('$store.site.title', scope, el);
        expect(evaluate()).toBe('My Site');
    });

    it('$dispatch fires custom events', () => {
        const scope = createMockScope({});
        const el = document.createElement('div');
        
        const handler = vi.fn();
        el.addEventListener('notify', handler);
        
        const executor = createExecutor("$dispatch('notify', { msg: 'hello' })", scope, el);
        executor();
        
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail).toEqual({ msg: 'hello' });
    });

    it('$nextTick delays execution', async () => {
        const scope = createMockScope({ value: 1 });
        const el = document.createElement('div');
        
        let capturedValue = null;
        const executor = createExecutor('$nextTick(() => { capturedValue = value })', scope, el);
        
        // Make capturedValue accessible
        globalThis.capturedValue = null;
        const executor2 = createExecutor('$nextTick(() => { globalThis.capturedValue = value })', scope, el);
        executor2();
        
        await new Promise(resolve => queueMicrotask(resolve));
        
        expect(globalThis.capturedValue).toBe(1);
        delete globalThis.capturedValue;
    });
});

describe('createExecutor', () => {
    it('executes statements that modify state', () => {
        const scope = createMockScope({ count: 0 });
        const el = document.createElement('div');
        
        const executor = createExecutor('count++', scope, el);
        executor();
        
        expect(scope.data.count).toBe(1);
    });

    it('executes multiple statements', () => {
        const scope = createMockScope({ a: 1, b: 2 });
        const el = document.createElement('div');
        
        const executor = createExecutor('a = 10; b = 20', scope, el);
        executor();
        
        expect(scope.data.a).toBe(10);
        expect(scope.data.b).toBe(20);
    });

    it('can call methods on data', () => {
        const scope = createMockScope({
            items: [],
            add(item) { this.items.push(item); }
        });
        const el = document.createElement('div');
        
        const executor = createExecutor("add('test')", scope, el);
        executor();
        
        expect(scope.data.items).toContain('test');
    });
});
