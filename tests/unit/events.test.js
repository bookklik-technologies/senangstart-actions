/**
 * Tests for ss-on / event handling
 * @module tests/unit/events
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    it('handles self modifier', () => {
        const el = document.createElement('div');
        const child = document.createElement('span');
        el.appendChild(child);
        const scope = createMockScope({ fired: false });

        handleEvent(el, 'ss-on:click.self', 'fired = true', scope);

        child.click();
        expect(scope.data.fired).toBe(false);

        el.click();
        expect(scope.data.fired).toBe(true);
    });

    it('handles once modifier and removes from actual listener target', () => {
        const scope = createMockScope({ count: 0 });
        const el = document.createElement('button');
        document.body.appendChild(el);

        handleEvent(el, 'ss-on:click.once', 'count++', scope);

        el.click();
        el.click();
        expect(scope.data.count).toBe(1);

        // once with .window must remove from window, not el
        const winScope = createMockScope({ winCount: 0 });
        handleEvent(el, 'ss-on:keydown.once.window', 'winCount++', winScope);

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(winScope.data.winCount).toBe(1);

        el.remove();
    });

    it('supports window and document listener targets', () => {
        const el = document.createElement('button');
        const winScope = createMockScope({ value: '' });
        const docScope = createMockScope({ value: '' });

        handleEvent(el, 'ss-on:custom.window', 'value = "from-window"', winScope);
        handleEvent(el, 'ss-on:custom.document', 'value = "from-document"', docScope);

        window.dispatchEvent(new Event('custom'));
        document.dispatchEvent(new Event('custom'));

        expect(winScope.data.value).toBe('from-window');
        expect(docScope.data.value).toBe('from-document');
    });

    it('supports capture and passive options', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ fired: false });

        // Capture: attached to parent with capture, dispatched on child — parent fires first
        const parent = document.createElement('div');
        parent.appendChild(el);
        const order = [];
        parent.addEventListener('click', () => order.push('parent-bubble'), { once: true });

        document.body.appendChild(parent);
        handleEvent(parent, 'ss-on:click.capture', 'fired = true', scope);
        parent.addEventListener('click', () => order.push('ss-capture'), { capture: true, once: true });

        el.click();

        expect(scope.data.fired).toBe(true);
        parent.remove();
    });

    it('handles passive.false as non-key modifier', () => {
        const el = document.createElement('input');
        const scope = createMockScope({ fired: false });

        handleEvent(el, 'ss-on:keydown.passive.false', 'fired = true', scope);

        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

        expect(scope.data.fired).toBe(true);
    });

    describe('debounce and throttle', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('debounces with default 250ms', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ calls: 0 });

            handleEvent(el, 'ss-on:input.debounce', 'calls++', scope);

            el.dispatchEvent(new Event('input'));
            el.dispatchEvent(new Event('input'));
            el.dispatchEvent(new Event('input'));

            expect(scope.data.calls).toBe(0);

            vi.advanceTimersByTime(249);
            expect(scope.data.calls).toBe(0);

            vi.advanceTimersByTime(1);
            expect(scope.data.calls).toBe(1);
        });

        it('debounces with custom duration', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ calls: 0 });

            handleEvent(el, 'ss-on:input.debounce.500ms', 'calls++', scope);

            el.dispatchEvent(new Event('input'));
            vi.advanceTimersByTime(499);
            expect(scope.data.calls).toBe(0);
            vi.advanceTimersByTime(1);
            expect(scope.data.calls).toBe(1);
        });

        it('throttles with default 250ms', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ calls: 0 });

            handleEvent(el, 'ss-on:scroll.throttle', 'calls++', scope);

            el.dispatchEvent(new Event('scroll'));
            el.dispatchEvent(new Event('scroll'));
            expect(scope.data.calls).toBe(1);

            vi.advanceTimersByTime(250);
            el.dispatchEvent(new Event('scroll'));
            expect(scope.data.calls).toBe(2);
        });

        it('throttles with custom duration', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ calls: 0 });

            handleEvent(el, 'ss-on:scroll.throttle.750ms', 'calls++', scope);

            el.dispatchEvent(new Event('scroll'));
            expect(scope.data.calls).toBe(1);

            vi.advanceTimersByTime(749);
            el.dispatchEvent(new Event('scroll'));
            expect(scope.data.calls).toBe(1);

            vi.advanceTimersByTime(1);
            el.dispatchEvent(new Event('scroll'));
            expect(scope.data.calls).toBe(2);
        });
    });

    it('supports camel modifier for event names', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ fired: false });

        handleEvent(el, 'ss-on:custom-event.camel', 'fired = true', scope);

        el.dispatchEvent(new Event('customEvent'));
        expect(scope.data.fired).toBe(true);

        el.dispatchEvent(new Event('custom-event'));
        expect(scope.data.fired).toBe(true);
    });

    it('supports dot modifier for event names', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ fired: false });

        handleEvent(el, 'ss-on:custom-event.dot', 'fired = true', scope);

        el.dispatchEvent(new Event('custom.event'));
        expect(scope.data.fired).toBe(true);
    });

    describe('outside modifier', () => {
        let inner, outer;

        let elVisible = (node) => {
            // jsdom reports offsetWidth/offsetHeight as 0; make element "visible"
            Object.defineProperty(node, 'offsetWidth', { value: 100, configurable: true });
            Object.defineProperty(node, 'offsetHeight', { value: 50, configurable: true });
        };
        let elHidden = (node) => {
            Object.defineProperty(node, 'offsetWidth', { value: 0, configurable: true });
            Object.defineProperty(node, 'offsetHeight', { value: 0, configurable: true });
        };

        beforeEach(() => {
            document.body.innerHTML = '';
            outer = document.createElement('div');
            inner = document.createElement('div');
            outer.appendChild(inner);
            document.body.appendChild(outer);
            elVisible(outer);
        });

        it('fires when clicking outside the element', () => {
            const scope = createMockScope({ count: 0 });
            handleEvent(outer, 'ss-on:click.outside', 'count++', scope);

            outer.click();
            expect(scope.data.count).toBe(0);

            document.body.click();
            expect(scope.data.count).toBe(1);
        });

        it('does not fire when target is inside element', () => {
            const scope = createMockScope({ fired: false });
            handleEvent(outer, 'ss-on:click.outside', 'fired = true', scope);

            inner.click();
            expect(scope.data.fired).toBe(false);
        });

        it('does not fire when target is not connected', () => {
            const scope = createMockScope({ count: 0 });
            handleEvent(outer, 'ss-on:click.outside', 'count++', scope);

            const detached = document.createElement('div');
            detached.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(scope.data.count).toBe(0);
        });

        it('does not fire when element is hidden', () => {
            const scope = createMockScope({ fired: false });

            elHidden(outer);
            handleEvent(outer, 'ss-on:click.outside', 'fired = true', scope);

            document.body.click();
            expect(scope.data.fired).toBe(false);
        });

        it('supports .away as alias', () => {
            const scope = createMockScope({ count: 0 });
            handleEvent(outer, 'ss-on:click.away', 'count++', scope);

            outer.click();
            expect(scope.data.count).toBe(0);

            document.body.click();
            expect(scope.data.count).toBe(1);
        });
    });

    describe('keyboard events', () => {
        it('supports kebab-case key names', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ submitted: false });

            handleEvent(el, 'ss-on:keydown.arrow-up', 'submitted = true', scope);

            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            expect(scope.data.submitted).toBe(true);
        });

        it('supports arbitrary kebab-cased keys with capitalized names', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ submitted: false });

            handleEvent(el, 'ss-on:keydown.page-down', 'submitted = true', scope);

            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
            expect(scope.data.submitted).toBe(true);
        });

        it('supports key aliases', () => {
            const cases = [
                ['esc', 'Escape'],
                ['space', ' '],
                ['spacebar', ' '],
                ['slash', '/'],
                ['period', '.'],
                ['comma', ','],
                ['equal', '='],
                ['minus', '-'],
                ['underscore', '_'],
                ['up', 'ArrowUp'],
                ['down', 'ArrowDown'],
                ['left', 'ArrowLeft'],
                ['right', 'ArrowRight'],
                ['ctrl', 'Control'],
                ['enter', 'Enter'],
                ['escape', 'Escape'],
                ['tab', 'Tab'],
            ];

            cases.forEach(([modifier, key]) => {
                const el = document.createElement('input');
                const scope = createMockScope({ fired: false });
                handleEvent(el, `ss-on:keydown.${modifier}`, 'fired = true', scope);

                el.dispatchEvent(new KeyboardEvent('keydown', { key }));
                expect(scope.data.fired, `alias ${modifier} for key "${key}"`).toBe(true);
            });
        });

        it('supports system modifiers with key combos', () => {
            const el = document.createElement('input');
            const scope = createMockScope({ fired: false });

            handleEvent(el, 'ss-on:keydown.ctrl.enter', 'fired = true', scope);

            // Without ctrl pressed — no fire
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            expect(scope.data.fired).toBe(false);

            // With ctrl pressed — fires
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
            expect(scope.data.fired).toBe(true);
        });

        it('supports cmd and super as meta aliases', () => {
            ['cmd', 'super', 'meta'].forEach((modifier) => {
                const el = document.createElement('input');
                const scope = createMockScope({ fired: false });
                handleEvent(el, `ss-on:keydown.${modifier}.enter`, 'fired = true', scope);

                el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true }));
                expect(scope.data.fired, `system alias ${modifier}`).toBe(true);
            });
        });

        it('ignores non-key modifiers when filtering keys', () => {
            vi.useFakeTimers();
            const el = document.createElement('button');
            const scope = createMockScope({ fired: false });

            // debounce modifier should not be treated as key name
            handleEvent(el, 'ss-on:keydown.debounce.100ms', 'fired = true', scope);

            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
            vi.advanceTimersByTime(100);
            expect(scope.data.fired).toBe(true);
            vi.useRealTimers();
        });

        it('supports system modifiers on click events', () => {
            const el = document.createElement('button');
            const scope = createMockScope({ fired: false });

            handleEvent(el, 'ss-on:click.shift', 'fired = true', scope);

            el.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
            expect(scope.data.fired).toBe(true);
        });
    });

    it('provides $event to handler', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ eventType: '' });
        
        handleEvent(el, 'ss-on:click', 'eventType = $event.type', scope);
        el.click();
        
        expect(scope.data.eventType).toBe('click');
    });

    it('supports bare method reference expressions', () => {
        const el = document.createElement('button');
        let receivedEvent = null;
        const scope = createMockScope({
            handleClick(e) { receivedEvent = e; }
        });

        handleEvent(el, 'ss-on:click', 'handleClick', scope);
        el.click();

        expect(receivedEvent).not.toBeNull();
        expect(receivedEvent.type).toBe('click');
    });

    it('returns a removeListener function', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ count: 0 });

        const remove = handleEvent(el, 'ss-on:click', 'count++', scope);
        el.click();
        expect(scope.data.count).toBe(1);

        remove();
        el.click();
        expect(scope.data.count).toBe(1);
    });
});
