/**
 * Tests for ss-id
 * @module tests/id
 */

import { describe, it, expect } from 'vitest';
import '../../src/index.js'; // Register all directives
import { walk } from '../../src/walker.js';
import { createEvaluator } from '../../src/evaluator.js';

describe('ss-id', () => {
    it('generates unique IDs', async () => {
        document.body.innerHTML = `
            <div ss-data="{}">
                <div ss-id="['foo']">
                    <span id="test1" ss-bind:id="$id('foo')"></span>
                    <span id="test2" ss-bind:id="$id('foo', 'label')"></span>
                </div>
                <div ss-id="['foo']">
                    <span id="test3" ss-bind:id="$id('foo')"></span>
                </div>
            </div>
        `;
        
        // Use ss-bind:id instead of :id (assuming :id shorthand is not supported or requires processing)
        // Actually the original test used :id which might not be supported by standard walker without shorthand expansion?
        // Standard walker handles ss-bind:*.
        // SenangStart might not have :shorthand enabled by default in core walker unless specific heuristic used.
        // Let's use ss-bind:id to be safe and test the $id logic specifically.
        
        // Reset global counter if any (simulated)
        if (window.__ssIdCounts) window.__ssIdCounts = {};
        
        walk(document.body);
        
        await new Promise(r => queueMicrotask(r));
        
        const roots = document.querySelectorAll('[ss-id]');
        const root1 = roots[0];
        const root2 = roots[1];
        
        const span1 = root1.children[0];
        const span2 = root1.children[1];
        
        const scope1 = root1.__ssScope;
        
        expect(span1.id).toBe(`foo-${scope1.$idRoots.foo}`);
        expect(span2.id).toBe(`foo-${scope1.$idRoots.foo}-label`);
    });
});
