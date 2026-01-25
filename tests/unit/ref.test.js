/**
 * Tests for ss-ref directive
 * @module tests/unit/ref
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

describe('ss-ref handler', () => {
    it('registers element in $refs', () => {
        const el = document.createElement('input');
        const scope = createMockScope({});
        
        attributeHandlers['ss-ref'](el, 'myInput', scope);
        
        expect(scope.$refs.myInput).toBe(el);
    });
});
