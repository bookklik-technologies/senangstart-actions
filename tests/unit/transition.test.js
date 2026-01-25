/**
 * Tests for ss-transition modifiers
 * @module tests/transition
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleTransition } from '../../src/handlers/attributes.js';

describe('ss-transition modifiers', () => {
    let el;
    
    beforeEach(() => {
        el = document.createElement('div');
        vi.useFakeTimers();
        // Mock requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            cb();
            return 1;
        });
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('parses duration modifier', () => {
        el.setAttribute('ss-transition.duration.500ms', '');
        
        handleTransition(el, true, 'block');
        
        // Check inline styles applied during transition
        expect(el.style.transitionDuration).toBe('500ms');
    });

    it('parses delay modifier', () => {
        el.setAttribute('ss-transition.delay.200ms', '');
        
        handleTransition(el, true, 'block');
        
        expect(el.style.transitionDelay).toBe('200ms');
    });

    it('parses separate enter/leave config', () => {
        el.setAttribute('ss-transition:enter.duration.100ms', '');
        el.setAttribute('ss-transition:leave.duration.300ms', '');
        
        // Reset styles
        el.style.transitionDuration = '';
        
        // Enter
        handleTransition(el, true, 'block');
        expect(el.style.transitionDuration).toBe('100ms');
        
        // Reset
        el.style.transitionDuration = '';
        
        // Leave
        handleTransition(el, false, 'block');
        expect(el.style.transitionDuration).toBe('300ms');
    });

    it('applies opacity and scale', () => {
        el.setAttribute('ss-transition.opacity.50.scale.80', '');
        
        // Enter start
        handleTransition(el, true, 'block');
        
        // Since we mocked rAF to run immediately, the end state is applied
        expect(el.style.opacity).toBe('1');
        expect(el.style.transform).toBe('scale(1)');
    });
});
