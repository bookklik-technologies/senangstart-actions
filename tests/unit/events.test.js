/**
 * Tests for ss-on / event handling
 * @module tests/unit/events
 */

import { describe, it, expect, vi } from 'vitest';
import { handleEvent } from '../../src/handlers/events.js';
import { createReactive } from '../../src/reactive.js';

function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

describe('ss-on handler', () => {
    it('handles click events', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ clicked: false });
        
        handleEvent(el, 'ss-on:click', 'clicked = true', scope);
        el.click();
        
        expect(scope.data.clicked).toBe(true);
    });

    it('handles prevent modifier', () => {
        const el = document.createElement('a');
        el.href = '#';
        const scope = createMockScope({});
        
        handleEvent(el, 'ss-on:click.prevent', '', scope);
        
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        const prevented = !el.dispatchEvent(event);
        
        // The handler should prevent default
        expect(event.defaultPrevented).toBe(true);
    });

    it('handles stop modifier', () => {
        const parent = document.createElement('div');
        const child = document.createElement('button');
        parent.appendChild(child);
        
        const parentHandler = vi.fn();
        parent.addEventListener('click', parentHandler);
        
        const scope = createMockScope({});
        handleEvent(child, 'ss-on:click.stop', '', scope);
        
        child.click();
        
        expect(parentHandler).not.toHaveBeenCalled();
    });

    it('handles keyboard events with enter modifier', () => {
        const el = document.createElement('input');
        const scope = createMockScope({ submitted: false });
        
        handleEvent(el, 'ss-on:keydown.enter', 'submitted = true', scope);
        
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        
        expect(scope.data.submitted).toBe(true);
    });

    it('ignores keyboard events that dont match modifier', () => {
        const el = document.createElement('input');
        const scope = createMockScope({ submitted: false });
        
        handleEvent(el, 'ss-on:keydown.enter', 'submitted = true', scope);
        
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        
        expect(scope.data.submitted).toBe(false);
    });

    it('provides $event to handler', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ eventType: '' });
        
        handleEvent(el, 'ss-on:click', 'eventType = $event.type', scope);
        el.click();
        
        expect(scope.data.eventType).toBe('click');
    });
});
