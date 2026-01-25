/**
 * Tests for ss-text and ss-html directives
 * @module tests/unit/text
 */

import { describe, it, expect } from 'vitest';
import { attributeHandlers } from '../../src/handlers/attributes.js';
import { createReactive } from '../../src/reactive.js';

function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

describe('ss-text handler', () => {
    it('sets element innerText from expression', () => {
        const el = document.createElement('span');
        const scope = createMockScope({ message: 'Hello World' });
        
        attributeHandlers['ss-text'](el, 'message', scope);
        
        expect(el.innerText).toBe('Hello World');
    });

    it('sets innerText to empty string for null/undefined', () => {
        const el = document.createElement('span');
        const scope = createMockScope({ value: null });
        
        attributeHandlers['ss-text'](el, 'value', scope);
        
        expect(el.innerText).toBe('');
    });

    it('evaluates expressions', () => {
        const el = document.createElement('span');
        const scope = createMockScope({ count: 5 });
        
        attributeHandlers['ss-text'](el, 'count * 2', scope);
        
        // innerText converts number to string
        expect(String(el.innerText)).toBe('10');
    });
});

describe('ss-html handler', () => {
    it('sets element innerHTML from expression', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ html: '<strong>Bold</strong>' });
        
        attributeHandlers['ss-html'](el, 'html', scope);
        
        expect(el.innerHTML).toBe('<strong>Bold</strong>');
    });
});
