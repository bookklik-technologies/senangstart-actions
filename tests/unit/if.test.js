/**
 * Tests for ss-if directive
 * @module tests/unit/if
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleIf, setWalkFunction } from '../../src/handlers/directives.js';
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

describe('ss-if directive', () => {
    beforeEach(() => {
        mockWalk.mockClear();
    });

    it('renders content when condition is true', async () => {
        const parent = document.createElement('div');
        const template = document.createElement('template');
        template.innerHTML = '<span class="conditional">Visible</span>';
        template.setAttribute('ss-if', 'show');
        parent.appendChild(template);
        
        const scope = createMockScope({ show: true });
        
        handleIf(template, 'show', scope);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const span = parent.querySelector('span.conditional');
        expect(span).not.toBeNull();
        expect(span.textContent).toBe('Visible');
    });

    it('does not render content when condition is false', async () => {
        const parent = document.createElement('div');
        const template = document.createElement('template');
        template.innerHTML = '<span class="conditional">Visible</span>';
        template.setAttribute('ss-if', 'show');
        parent.appendChild(template);
        
        const scope = createMockScope({ show: false });
        
        handleIf(template, 'show', scope);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const span = parent.querySelector('span.conditional');
        expect(span).toBeNull();
    });

    it('removes template element from DOM', () => {
        const parent = document.createElement('div');
        const template = document.createElement('template');
        template.innerHTML = '<span></span>';
        parent.appendChild(template);
        
        const scope = createMockScope({ show: false });
        
        handleIf(template, 'show', scope);
        
        expect(parent.querySelector('template')).toBeNull();
    });

    it('creates comment anchor node', () => {
        const parent = document.createElement('div');
        const template = document.createElement('template');
        template.innerHTML = '<span></span>';
        parent.appendChild(template);
        
        const scope = createMockScope({ show: true });
        
        handleIf(template, 'show', scope);
        
        const comments = Array.from(parent.childNodes).filter(n => n.nodeType === 8);
        expect(comments.length).toBe(1);
        expect(comments[0].textContent).toContain('ss-if');
    });

    it('evaluates complex expressions', async () => {
        const parent = document.createElement('div');
        const template = document.createElement('template');
        template.innerHTML = '<span>Admin</span>';
        parent.appendChild(template);
        
        const scope = createMockScope({ user: { role: 'admin' } });
        
        handleIf(template, "user.role === 'admin'", scope);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const span = parent.querySelector('span');
        expect(span).not.toBeNull();
    });

    it('calls walk function on rendered elements', async () => {
        const parent = document.createElement('div');
        const template = document.createElement('template');
        template.innerHTML = '<span></span>';
        parent.appendChild(template);
        
        const scope = createMockScope({ show: true });
        
        handleIf(template, 'show', scope);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        expect(mockWalk).toHaveBeenCalled();
    });
});
