/**
 * Tests for attribute handlers
 * @module tests/handlers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attributeHandlers } from '../src/handlers/attributes.js';
import { handleBind } from '../src/handlers/bind.js';
import { handleEvent } from '../src/handlers/events.js';
import { createReactive } from '../src/reactive.js';

// Helper to create a mock scope
function createMockScope(data = {}) {
    return {
        data: createReactive(data, () => {}),
        $refs: {},
        $store: {}
    };
}

describe('ss-text handler', () => {
    it('sets element innerText from expression', () => {
        const el = document.createElement('span');
        const scope = createMockScope({ message: 'Hello World' });
        
        attributeHandlers['ss-text'](el, 'message', scope);
        
        expect(el.innerText).toBe('Hello World');
    });

    it('sets innerText to empty string for null/undefined', () => {
        const el = document.createElement('span');
        const scope = createMockScope({ value: null });
        
        attributeHandlers['ss-text'](el, 'value', scope);
        
        expect(el.innerText).toBe('');
    });

    it('evaluates expressions', () => {
        const el = document.createElement('span');
        const scope = createMockScope({ count: 5 });
        
        attributeHandlers['ss-text'](el, 'count * 2', scope);
        
        // innerText converts number to string
        expect(String(el.innerText)).toBe('10');
    });
});

describe('ss-html handler', () => {
    it('sets element innerHTML from expression', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ html: '<strong>Bold</strong>' });
        
        attributeHandlers['ss-html'](el, 'html', scope);
        
        expect(el.innerHTML).toBe('<strong>Bold</strong>');
    });
});

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

describe('ss-model handler', () => {
    it('sets initial input value from data', () => {
        const el = document.createElement('input');
        el.type = 'text';
        const scope = createMockScope({ name: 'John' });
        
        attributeHandlers['ss-model'](el, 'name', scope);
        
        expect(el.value).toBe('John');
    });

    it('updates data on input event', () => {
        const el = document.createElement('input');
        el.type = 'text';
        const scope = createMockScope({ name: '' });
        
        attributeHandlers['ss-model'](el, 'name', scope);
        
        el.value = 'Jane';
        el.dispatchEvent(new Event('input'));
        
        expect(scope.data.name).toBe('Jane');
    });

    it('handles checkbox binding', () => {
        const el = document.createElement('input');
        el.type = 'checkbox';
        const scope = createMockScope({ checked: true });
        
        attributeHandlers['ss-model'](el, 'checked', scope);
        
        expect(el.checked).toBe(true);
        
        el.checked = false;
        el.dispatchEvent(new Event('change'));
        
        expect(scope.data.checked).toBe(false);
    });

    it('handles radio binding', () => {
        const el = document.createElement('input');
        el.type = 'radio';
        el.value = 'option1';
        const scope = createMockScope({ selected: 'option1' });
        
        attributeHandlers['ss-model'](el, 'selected', scope);
        
        expect(el.checked).toBe(true);
    });

    it('handles select binding', () => {
        const el = document.createElement('select');
        el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
        const scope = createMockScope({ choice: 'b' });
        
        attributeHandlers['ss-model'](el, 'choice', scope);
        
        expect(el.value).toBe('b');
    });
});

describe('ss-ref handler', () => {
    it('registers element in $refs', () => {
        const el = document.createElement('input');
        const scope = createMockScope({});
        
        attributeHandlers['ss-ref'](el, 'myInput', scope);
        
        expect(scope.$refs.myInput).toBe(el);
    });
});

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

describe('ss-bind handler', () => {
    it('binds class attribute as string', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ cls: 'active highlight' });
        
        handleBind(el, 'ss-bind:class', 'cls', scope);
        
        expect(el.className).toBe('active highlight');
    });

    it('binds class attribute as object', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ isActive: true, isHidden: false });
        
        handleBind(el, 'ss-bind:class', '{ active: isActive, hidden: isHidden }', scope);
        
        expect(el.classList.contains('active')).toBe(true);
        expect(el.classList.contains('hidden')).toBe(false);
    });

    it('binds style attribute as string', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ styles: 'color: red; font-size: 16px' });
        
        handleBind(el, 'ss-bind:style', 'styles', scope);
        
        expect(el.style.color).toBe('red');
    });

    it('binds style attribute as object', () => {
        const el = document.createElement('div');
        const scope = createMockScope({});
        
        handleBind(el, 'ss-bind:style', "{ color: 'blue', fontSize: '20px' }", scope);
        
        expect(el.style.color).toBe('blue');
        expect(el.style.fontSize).toBe('20px');
    });

    it('binds disabled attribute', () => {
        const el = document.createElement('button');
        const scope = createMockScope({ isDisabled: true });
        
        handleBind(el, 'ss-bind:disabled', 'isDisabled', scope);
        
        expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('removes attribute when value is false', () => {
        const el = document.createElement('button');
        el.setAttribute('disabled', '');
        const scope = createMockScope({ isDisabled: false });
        
        handleBind(el, 'ss-bind:disabled', 'isDisabled', scope);
        
        expect(el.hasAttribute('disabled')).toBe(false);
    });

    it('binds custom data attributes', () => {
        const el = document.createElement('div');
        const scope = createMockScope({ id: 'item-123' });
        
        handleBind(el, 'ss-bind:data-id', 'id', scope);
        
        expect(el.getAttribute('data-id')).toBe('item-123');
    });
});

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
