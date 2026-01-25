/**
 * Tests for DOM walker
 * @module tests/walker
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { walk, setReferences } from '../../src/walker.js';
import { createReactive } from '../../src/reactive.js';

// Set up empty references
setReferences({}, {});

describe('walk function', () => {
    it('skips non-element nodes', () => {
        const textNode = document.createTextNode('Hello');
        
        // Should not throw
        expect(() => walk(textNode, null)).not.toThrow();
    });

    it('skips elements with ss-ignore', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-ignore', '');
        el.setAttribute('ss-data', '{ count: 0 }');
        
        walk(el, null);
        
        expect(el.__ssScope).toBeUndefined();
    });

    it('creates scope for elements with ss-data', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{ count: 5 }');
        
        walk(el, null);
        
        expect(el.__ssScope).toBeDefined();
        expect(el.__ssScope.data.count).toBe(5);
    });

    it('parses object literal in ss-data', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{ name: "John", active: true }');
        
        walk(el, null);
        
        expect(el.__ssScope.data.name).toBe('John');
        expect(el.__ssScope.data.active).toBe(true);
    });

    it('creates empty scope for empty ss-data', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '');
        
        walk(el, null);
        
        expect(el.__ssScope).toBeDefined();
        expect(el.__ssScope.data).toBeDefined();
    });

    it('inherits parent scope for child elements', () => {
        const parent = document.createElement('div');
        parent.setAttribute('ss-data', '{ count: 10 }');
        
        const child = document.createElement('span');
        child.setAttribute('ss-text', 'count');
        parent.appendChild(child);
        
        walk(parent, null);
        
        // innerText returns number as string
        expect(String(child.innerText)).toBe('10');
    });

    it('processes ss-text attributes', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{ message: "Hello" }');
        
        const span = document.createElement('span');
        span.setAttribute('ss-text', 'message');
        el.appendChild(span);
        
        walk(el, null);
        
        expect(span.innerText).toBe('Hello');
    });

    it('processes ss-show attributes', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{ visible: false }');
        
        const span = document.createElement('span');
        span.setAttribute('ss-show', 'visible');
        el.appendChild(span);
        
        walk(el, null);
        
        expect(span.style.display).toBe('none');
    });

    it('removes ss-cloak attribute after processing', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{}');
        el.setAttribute('ss-cloak', '');
        
        walk(el, null);
        
        expect(el.hasAttribute('ss-cloak')).toBe(false);
    });

    it('logs error for invalid ss-data expression', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{ invalid syntax }');
        
        walk(el, null);
        
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
    });

    it('ignores ss-describe attribute (metadata only)', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-data', '{}');
        el.setAttribute('ss-describe', 'This is a test component');
        
        // Should not throw and should not try to process ss-describe
        expect(() => walk(el, null)).not.toThrow();
    });

    it('walks child elements recursively', () => {
        const root = document.createElement('div');
        root.setAttribute('ss-data', '{ value: 42 }');
        
        const level1 = document.createElement('div');
        const level2 = document.createElement('span');
        level2.setAttribute('ss-text', 'value');
        
        level1.appendChild(level2);
        root.appendChild(level1);
        
        walk(root, null);
        
        // innerText returns number as string
        expect(String(level2.innerText)).toBe('42');
    });

    it('does not process directives without scope', () => {
        const el = document.createElement('div');
        el.setAttribute('ss-text', 'message');
        
        // No ss-data, no parent scope
        walk(el, null);
        
        // Element should not be modified (jsdom returns undefined for empty innerText)
        expect(el.innerText || '').toBe('');
    });
});

describe('registered data factories', () => {
    it('uses registered data factory by name', () => {
        const factories = {
            'counter': () => ({ count: 100 })
        };
        setReferences(factories, {});
        
        const el = document.createElement('div');
        el.setAttribute('ss-data', 'counter');
        
        walk(el, null);
        
        expect(el.__ssScope.data.count).toBe(100);
        
        // Reset
        setReferences({}, {});
    });
});
