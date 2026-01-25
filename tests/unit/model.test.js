/**
 * Tests for ss-model directive
 * @module tests/unit/model
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

describe('ss-model handler', () => {
    it('sets initial input value from data', () => {
        const el = document.createElement('input');
        el.type = 'text';
        const scope = createMockScope({ name: 'John' });
        
        attributeHandlers['ss-model'](el, 'name', scope);
        
        expect(el.value).toBe('John');
    });

    it('updates data on input event', () => {
        const el = document.createElement('input');
        el.type = 'text';
        const scope = createMockScope({ name: '' });
        
        attributeHandlers['ss-model'](el, 'name', scope);
        
        el.value = 'Jane';
        el.dispatchEvent(new Event('input'));
        
        expect(scope.data.name).toBe('Jane');
    });

    it('handles checkbox binding', () => {
        const el = document.createElement('input');
        el.type = 'checkbox';
        const scope = createMockScope({ checked: true });
        
        attributeHandlers['ss-model'](el, 'checked', scope);
        
        expect(el.checked).toBe(true);
        
        el.checked = false;
        el.dispatchEvent(new Event('change'));
        
        expect(scope.data.checked).toBe(false);
    });

    it('handles radio binding', () => {
        const el = document.createElement('input');
        el.type = 'radio';
        el.value = 'option1';
        const scope = createMockScope({ selected: 'option1' });
        
        attributeHandlers['ss-model'](el, 'selected', scope);
        
        expect(el.checked).toBe(true);
    });

    it('handles select binding', () => {
        const el = document.createElement('select');
        el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
        const scope = createMockScope({ choice: 'b' });
        
        attributeHandlers['ss-model'](el, 'choice', scope);
        
        expect(el.value).toBe('b');
    });
});
