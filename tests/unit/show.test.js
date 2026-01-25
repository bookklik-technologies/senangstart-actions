/**
 * Tests for ss-show directive
 * @module tests/unit/show
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

describe('ss-show handler', () => {
    it('shows element when expression is truthy', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ visible: true });
        
        attributeHandlers['ss-show'](el, 'visible', scope);
        
        expect(el.style.display).not.toBe('none');
    });

    it('hides element when expression is falsy', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ visible: false });
        
        attributeHandlers['ss-show'](el, 'visible', scope);
        
        expect(el.style.display).toBe('none');
    });
});
