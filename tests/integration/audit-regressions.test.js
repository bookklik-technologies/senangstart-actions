import { afterEach, describe, expect, it, vi } from 'vitest';
import { install as installData } from '../../src/directives/data.js';
import { install as installText } from '../../src/directives/text.js';
import { install as installModel } from '../../src/directives/model.js';
import { install as installIf } from '../../src/directives/if.js';
import { install as installFor } from '../../src/directives/for.js';
import { install as installId } from '../../src/directives/id.js';
import { install as installBind } from '../../src/directives/bind.js';
import { install as installOn } from '../../src/directives/on.js';
import { install as installTeleport } from '../../src/directives/teleport.js';
import { walk } from '../../src/walker.js';
import { setupObserver } from '../../src/observer.js';
import { createReactive, runEffect, cleanupTree } from '../../src/reactive.js';
import { createEvaluator, createExecutor } from '../../src/evaluator.js';

[installData, installText, installModel, installIf, installFor, installId, installBind, installOn, installTeleport]
    .forEach(install => install());

const flush = () => new Promise(resolve => queueMicrotask(resolve));
let observer;

afterEach(() => {
    observer?.disconnect();
    observer = undefined;
    cleanupTree(document.body);
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

function mount(html) {
    const root = document.createElement('div');
    root.innerHTML = html;
    document.body.appendChild(root);
    walk(root);
    return root;
}

describe('production directive audit regressions', () => {
    it('writes dotted and bracketed model paths back into their nested objects', () => {
        const root = mount(`<div ss-data="{ user: { name: 'Old' }, items: ['first'] }">
            <input ss-model="user.name"><input ss-model="items[0]">
        </div>`);
        const component = root.firstElementChild;
        const inputs = root.querySelectorAll('input');
        inputs[0].value = 'New';
        inputs[0].dispatchEvent(new Event('input'));
        inputs[1].value = 'updated';
        inputs[1].dispatchEvent(new Event('input'));
        expect(component.__ssScope.data.user.name).toBe('New');
        expect(component.__ssScope.data.items[0]).toBe('updated');
        expect(Object.hasOwn(component.__ssScope.data, 'user.name')).toBe(false);
    });

    it('uses change events for select bindings', () => {
        const root = mount(`<div ss-data="{ choice: 'a' }"><select ss-model="choice">
            <option>a</option><option>b</option>
        </select></div>`);
        const select = root.querySelector('select');
        select.value = 'b';
        select.dispatchEvent(new Event('change'));
        expect(root.firstElementChild.__ssScope.data.choice).toBe('b');
    });

    it('does not duplicate event handlers or reset data on repeated initialization', () => {
        const root = mount(`<div ss-data="{ count: 0 }"><button ss-on:click="count++"></button></div>`);
        const component = root.firstElementChild;
        component.__ssScope.data.count = 10;
        walk(root);
        root.querySelector('button').click();
        expect(component.__ssScope.data.count).toBe(11);
    });

    it('preserves existing event data rather than mutating it temporarily', () => {
        const root = mount(`<div ss-data="{ $event: 'saved', type: '' }">
            <button ss-on:click="type = $event.type"></button>
        </div>`);
        root.querySelector('button').click();
        const data = root.firstElementChild.__ssScope.data;
        expect(data.type).toBe('click');
        expect(data.$event).toBe('saved');
    });

    it('keeps conditional DOM when an expression remains truthy and preserves text nodes', async () => {
        const root = mount(`<div ss-data="{ count: 1 }"><template ss-if="count">hello<input></template></div>`);
        const component = root.firstElementChild;
        const input = root.querySelector('input');
        input.value = 'keep me';
        component.__ssScope.data.count = 2;
        await flush();
        expect(root.querySelector('input')).toBe(input);
        expect(input.value).toBe('keep me');
        expect(component.textContent).toBe('hello');
        component.__ssScope.data.count = 0;
        await flush();
        expect(component.textContent).toBe('');
    });

    it('keeps loop parent reads and writes live without replacing unaffected rows', async () => {
        const root = mount(`<div ss-data="{ label: 'before', count: 0, items: [1] }">
            <template ss-for="item in items"><button ss-text="label" ss-on:click="count++"></button></template>
        </div>`);
        const data = root.firstElementChild.__ssScope.data;
        const button = root.querySelector('button');
        button.click();
        expect(data.count).toBe(1);
        data.label = 'after';
        await flush();
        expect(root.querySelector('button')).toBe(button);
        expect(button.innerText).toBe('after');
    });

    it('renders cyclic list items without JSON serialization', () => {
        const root = document.createElement('div');
        const item = { name: 'cycle' };
        item.self = item;
        root.innerHTML = '<template ss-for="item in items"><span ss-text="item.name"></span></template>';
        document.body.appendChild(root);
        const scope = { data: createReactive({ items: [item] }), $refs: {}, $store: {} };
        expect(() => walk(root, scope)).not.toThrow();
        expect(root.querySelector('span').innerText).toBe('cycle');
    });

    it('cleans nested structural regions rather than only their removed template hosts', async () => {
        const root = mount(`<div ss-data="{ visible: true, items: [1] }">
            <template ss-if="visible"><template ss-for="item in items"><button></button></template></template>
        </div>`);
        const data = root.firstElementChild.__ssScope.data;
        expect(root.querySelectorAll('button').length).toBe(1);
        data.visible = false;
        await flush();
        expect(root.querySelectorAll('button').length).toBe(0);
        data.items.push(2);
        await flush();
        expect(root.querySelectorAll('button').length).toBe(0);
    });

    it('isolates nested ID roots and preserves zero-valued ID keys in executors', () => {
        const root = mount(`<div ss-data="{}" ss-id="['field']">
            <span ss-id="['field']"></span><span ss-id="['field']"></span>
        </div>`);
        const parent = root.firstElementChild;
        const parentId = parent.__ssScope.$idRoots.field;
        const firstId = parent.children[0].__ssScope.$idRoots.field;
        const secondId = parent.children[1].__ssScope.$idRoots.field;
        expect(new Set([parentId, firstId, secondId]).size).toBe(3);
        createExecutor("$el.id = $id('field', 0)", parent.__ssScope, parent)();
        expect(parent.id).toBe(`field-${parentId}-0`);
    });

    it('rolls back stale classes and styles while preserving static values', async () => {
        const root = mount(`<div ss-data="{ classes: { active: true }, styles: { color: 'red' } }">
            <span class="static" style="font-weight: bold" ss-bind:class="classes" ss-bind:style="styles"></span>
        </div>`);
        const data = root.firstElementChild.__ssScope.data;
        const span = root.querySelector('span');
        data.classes = null;
        data.styles = { backgroundColor: 'blue' };
        await flush();
        expect(span.className).toBe('static');
        expect(span.style.color).toBe('');
        expect(span.style.fontWeight).toBe('bold');
        expect(span.style.backgroundColor).toBe('blue');
    });
});

describe('evaluator audit regressions', () => {
    it('keeps watchers reactive across multiple updates and reports old values', async () => {
        const callback = vi.fn();
        const scope = { data: createReactive({ count: 0, callback }), $refs: {}, $store: {} };
        createExecutor("$watch('count', callback)", scope, document.body)();
        expect(callback).not.toHaveBeenCalled();
        scope.data.count = 1;
        await flush();
        scope.data.count = 2;
        await flush();
        expect(callback.mock.calls).toEqual([[1, 0], [2, 1]]);
    });

    it('tracks only data actually used by an expression and accepts non-identifier keys', async () => {
        const scope = { data: createReactive({ count: 1, unused: 0, 'invalid-key': 2 }), $refs: {}, $store: {} };
        const evaluate = createEvaluator('count + 1', scope, document.body);
        const effect = vi.fn(evaluate);
        runEffect(effect, document.body);
        scope.data.unused++;
        await flush();
        expect(effect).toHaveBeenCalledTimes(1);
        expect(effect).toHaveLastReturnedWith(2);
    });

    it('does not read unrelated getters while evaluating expressions', () => {
        const scope = { data: createReactive({ count: 1, get broken() { throw new Error('unused'); } }), $refs: {}, $store: {} };
        expect(createEvaluator('count', scope, document.body)()).toBe(1);
    });
});

describe('observer audit regressions', () => {
    it('processes later additions after an already initialized node in the same batch', async () => {
        const root = mount('<div ss-data="{ label: 7 }"></div>');
        const component = root.firstElementChild;
        observer = setupObserver();
        const initialized = document.createElement('i');
        walk(initialized, component.__ssScope);
        const fresh = document.createElement('span');
        fresh.setAttribute('ss-text', 'label');
        const fragment = document.createDocumentFragment();
        fragment.append(initialized, fresh);
        component.appendChild(fragment);
        await flush();
        expect(String(fresh.innerText)).toBe('7');
        expect(fresh.__ssInitialized).toBe(true);
    });

    it('releases global event listeners when their component is removed', async () => {
        const root = mount(`<div ss-data="{ count: 0 }">
            <span ss-on:ping.window="count++"></span>
        </div>`);
        const data = root.firstElementChild.__ssScope.data;
        observer = setupObserver();
        window.dispatchEvent(new Event('ping'));
        expect(data.count).toBe(1);
        root.remove();
        await flush();
        window.dispatchEvent(new Event('ping'));
        expect(data.count).toBe(1);
    });

    it('removes teleported content when its source component is removed', async () => {
        const target = document.createElement('div');
        target.id = 'teleport-audit';
        document.body.appendChild(target);
        const root = mount(`<div ss-data="{ label: 'moved' }">
            <template ss-teleport="#teleport-audit">text<span ss-text="label"></span></template>
        </div>`);
        expect(target.childNodes.length).toBe(2);
        observer = setupObserver();
        root.remove();
        await flush();
        expect(target.childNodes.length).toBe(0);
    });
});
