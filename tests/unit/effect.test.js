/**
 * Tests for ss-effect and ss-init directives
 * @module tests/unit/effect
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

describe('ss-init handler', () => {
    it('executes initialization code once', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ initialized: false });
        
        attributeHandlers['ss-init'](el, 'initialized = true', scope);
        
        expect(scope.data.initialized).toBe(true);
    });
});

describe('ss-effect handler', () => {
    it('executes effect code', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ count: 5, result: 0 });
        
        attributeHandlers['ss-effect'](el, 'result = count * 2', scope);
        
        expect(scope.data.result).toBe(10);
    });
});
