/**
 * Integration tests for SenangStart Actions
 * @module tests/integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '../../src/index.js'; // Register all directives
import { walk, setReferences } from '../../src/walker.js';
import { createReactive } from '../../src/reactive.js';

describe('Integration Tests', () => {
    beforeEach(() => {
        setReferences({}, {});
    });

    describe('Complete Component', () => {
        it('renders a complete component with multiple directives', async () => {
            const html = `
                <div ss-data="{ count: 0, items: ['Apple', 'Banana'] }">
                    <h1 ss-text="'Count: ' + count"></h1>
                    <button ss-on:click="count++">Increment</button>
                    <ul>
                        <template ss-for="item in items">
                            <li class="list-item"></li>
                        </template>
                    </ul>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            // Wait for effects
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // Check initial state
            expect(component.querySelector('h1').innerText).toBe('Count: 0');
            
            // Check list rendering
            const listItems = component.querySelectorAll('li.list-item');
            expect(listItems.length).toBe(2);
        });

        it('updates reactively on state change', async () => {
            const html = `
                <div ss-data="{ message: 'Hello' }">
                    <span ss-text="message"></span>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            expect(component.querySelector('span').innerText).toBe('Hello');
            
            // Update state
            component.__ssScope.data.message = 'World';
            
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(component.querySelector('span').innerText).toBe('World');
        });

        it('handles button click to update counter', async () => {
            const html = `
                <div ss-data="{ count: 0 }">
                    <span ss-text="count"></span>
                    <button ss-on:click="count++">+</button>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            expect(String(component.querySelector('span').innerText)).toBe('0');
            
            // Click button
            component.querySelector('button').click();
            
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(String(component.querySelector('span').innerText)).toBe('1');
        });
    });

    describe('Two-way Binding', () => {
        it('syncs input value with data', async () => {
            const html = `
                <div ss-data="{ text: '' }">
                    <input type="text" ss-model="text">
                    <span ss-text="text"></span>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            const input = component.querySelector('input');
            const span = component.querySelector('span');
            
            // Type in input
            input.value = 'Hello World';
            input.dispatchEvent(new Event('input'));
            
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(span.innerText).toBe('Hello World');
        });
    });

    describe('Conditional Rendering', () => {
        it('shows/hides content based on ss-if', async () => {
            const html = `
                <div ss-data="{ show: false }">
                    <button ss-on:click="show = !show">Toggle</button>
                    <template ss-if="show">
                        <div class="content">Visible</div>
                    </template>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // Initially hidden
            expect(component.querySelector('.content')).toBeNull();
            
            // Toggle
            component.querySelector('button').click();
            
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // Now visible
            expect(component.querySelector('.content')).not.toBeNull();
        });
    });

    describe('Global Store', () => {
        it('accesses global store from components', () => {
            const stores = {
                site: createReactive({ title: 'My App' }, () => {})
            };
            setReferences({}, stores);
            
            const html = `
                <div ss-data="{}">
                    <h1 ss-text="$store.site.title"></h1>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            expect(component.querySelector('h1').innerText).toBe('My App');
        });
    });

    describe('Registered Data Factories', () => {
        it('uses registered data factory', async () => {
            const factories = {
                'dropdown': () => ({
                    open: false,
                    toggle() { this.open = !this.open; }
                })
            };
            setReferences(factories, {});
            
            const html = `
                <div ss-data="dropdown">
                    <button ss-on:click="toggle()">Toggle</button>
                    <div ss-show="open" class="menu">Menu</div>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            const menu = component.querySelector('.menu');
            expect(menu.style.display).toBe('none');
            
            // Toggle - click updates state synchronously but ss-show effect is reactive
            component.querySelector('button').click();
            
            // Wait for reactive effect to run
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(menu.style.display).not.toBe('none');
        });
    });

    describe('Element References', () => {
        it('registers refs and allows access', () => {
            const html = `
                <div ss-data="{}">
                    <input ss-ref="myInput" type="text">
                    <button ss-on:click="$refs.myInput.focus()">Focus</button>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            expect(component.__ssScope.$refs.myInput).toBe(component.querySelector('input'));
        });
    });

    describe('Custom Events', () => {
        it('dispatches custom events with $dispatch', () => {
            const html = `
                <div ss-data="{ received: false }" ss-on:notify="received = true">
                    <button ss-on:click="$dispatch('notify')">Notify</button>
                </div>
            `;
            
            const container = document.createElement('div');
            container.innerHTML = html;
            const component = container.firstElementChild;
            
            walk(component, null);
            
            expect(component.__ssScope.data.received).toBe(false);
            
            component.querySelector('button').click();
            
            expect(component.__ssScope.data.received).toBe(true);
        });
    });
});
