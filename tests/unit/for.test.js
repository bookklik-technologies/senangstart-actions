/**
 * Tests for ss-for directive
 * @module tests/unit/for
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFor, setWalkFunction } from '../../src/handlers/directives.js';
import { createReactive } from '../../src/reactive.js';

// Helper to create a mock scope
function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

// Mock walk function for testing
const mockWalk = vi.fn();
setWalkFunction(mockWalk);

describe('ss-for directive', () => {
    beforeEach(() => {
        mockWalk.mockClear();
    });

    it('renders items from array', async () => {
        const parent = document.createElement('ul');
        const template = document.createElement('template');
        template.innerHTML = '<li class="item"></li>';
        template.setAttribute('ss-for', 'item in items');
        parent.appendChild(template);
        
        const scope = createMockScope({ items: ['a', 'b', 'c'] });
        
        handleFor(template, 'item in items', scope);
        
        // Wait for effect to run
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const listItems = parent.querySelectorAll('li.item');
        expect(listItems.length).toBe(3);
    });

    it('removes template element from DOM', () => {
        const parent = document.createElement('ul');
        const template = document.createElement('template');
        template.innerHTML = '<li></li>';
        template.setAttribute('ss-for', 'item in items');
        parent.appendChild(template);
        
        const scope = createMockScope({ items: [] });
        
        handleFor(template, 'item in items', scope);
        
        expect(parent.querySelector('template')).toBeNull();
    });

    it('creates comment anchor node', () => {
        const parent = document.createElement('ul');
        const template = document.createElement('template');
        template.innerHTML = '<li></li>';
        parent.appendChild(template);
        
        const scope = createMockScope({ items: [] });
        
        handleFor(template, 'item in items', scope);
        
        const comments = Array.from(parent.childNodes).filter(n => n.nodeType === 8);
        expect(comments.length).toBe(1);
        expect(comments[0].textContent).toContain('ss-for');
    });

    it('parses (item, index) syntax', async () => {
        const parent = document.createElement('ul');
        const template = document.createElement('template');
        template.innerHTML = '<li></li>';
        parent.appendChild(template);
        
        const scope = createMockScope({ items: ['a', 'b'] });
        
        handleFor(template, '(item, idx) in items', scope);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // mockWalk should have been called with scopes containing item and idx
        expect(mockWalk).toHaveBeenCalled();
    });

    it('handles empty array', async () => {
        const parent = document.createElement('ul');
        const template = document.createElement('template');
        template.innerHTML = '<li></li>';
        parent.appendChild(template);
        
        const scope = createMockScope({ items: [] });
        
        handleFor(template, 'item in items', scope);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const listItems = parent.querySelectorAll('li');
        expect(listItems.length).toBe(0);
    });

    it('logs error for invalid expression', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        const parent = document.createElement('ul');
        const template = document.createElement('template');
        template.innerHTML = '<li></li>';
        parent.appendChild(template);
        
        const scope = createMockScope({});
        
        handleFor(template, 'invalid syntax here', scope);
        
        expect(consoleSpy).toHaveBeenCalledWith(
            '[SenangStart] Invalid ss-for expression:',
            'invalid syntax here'
        );
        
        consoleSpy.mockRestore();
    });
});
