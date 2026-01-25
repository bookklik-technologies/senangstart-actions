/**
 * Tests for ss-bind directive
 * @module tests/unit/bind
 */

import { describe, it, expect } from 'vitest';
import { handleBind } from '../../src/handlers/bind.js';
import { createReactive } from '../../src/reactive.js';

function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

describe('ss-bind handler', () => {
    it('binds class attribute as string', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ cls: 'active highlight' });
        
        handleBind(el, 'ss-bind:class', 'cls', scope);
        
        expect(el.className).toBe('active highlight');
    });

    it('binds class attribute as object', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ isActive: true, isHidden: false });
        
        handleBind(el, 'ss-bind:class', '{ active: isActive, hidden: isHidden }', scope);
        
        expect(el.classList.contains('active')).toBe(true);
        expect(el.classList.contains('hidden')).toBe(false);
    });

    it('binds style attribute as string', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ styles: 'color: red; font-size: 16px' });
        
        handleBind(el, 'ss-bind:style', 'styles', scope);
        
        expect(el.style.color).toBe('red');
    });

    it('binds style attribute as object', () => {
        const el = document.createElement('div');
        const scope = createMockScope({});
        
        handleBind(el, 'ss-bind:style', "{ color: 'blue', fontSize: '20px' }", scope);
        
        expect(el.style.color).toBe('blue');
        expect(el.style.fontSize).toBe('20px');
    });

    it('binds disabled attribute', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ isDisabled: true });
        
        handleBind(el, 'ss-bind:disabled', 'isDisabled', scope);
        
        expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('removes attribute when value is false', () => {
        const el = document.createElement('button');
        el.setAttribute('disabled', '');
        const scope = createMockScope({ isDisabled: false });
        
        handleBind(el, 'ss-bind:disabled', 'isDisabled', scope);
        
        expect(el.hasAttribute('disabled')).toBe(false);
    });

    it('binds custom data attributes', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ id: 'item-123' });
        
        handleBind(el, 'ss-bind:data-id', 'id', scope);
        
        expect(el.getAttribute('data-id')).toBe('item-123');
    });
});
