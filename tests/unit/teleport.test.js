/**
 * Tests for ss-teleport
 * @module tests/teleport
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handleTeleport } from '../../src/handlers/directives.js';
import { createReactive } from '../../src/reactive.js';

// Helper to create a mock scope
function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

describe('ss-teleport', () => {
    let container;
    
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('teleports content to target', () => {
        const target = document.createElement('div');
        target.id = 'target';
        document.body.appendChild(target);
        
        const template = document.createElement('template');
        template.innerHTML = '<span>Teleported</span>';
        container.appendChild(template);
        
        const scope = createMockScope({});
        
        handleTeleport(template, '#target', scope);
        
        // Template should be removed
        expect(container.querySelector('template')).toBeNull();
        // Anchor should exist
        expect(container.childNodes.length).toBeGreaterThan(0); 
        // Content should be in target
        expect(target.innerHTML).toBe('<span>Teleported</span>');
    });

    it('warns if target not found', () => {
        const template = document.createElement('template');
        template.innerHTML = '<span>Teleported</span>';
        container.appendChild(template);
        
        const scope = createMockScope({});
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        handleTeleport(template, '#non-existent', scope);
        
        expect(consoleSpy).toHaveBeenCalled();
        // Template should still be removed (implementation detail: we remove it to replace with anchor first)
        expect(container.querySelector('template')).toBeNull();
    });
});
