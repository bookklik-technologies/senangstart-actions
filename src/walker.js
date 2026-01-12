/**
 * SenangStart Actions - DOM Walker
 * Recursive DOM traversal and initialization
 * 
 * @module walker
 */

import { createReactive } from './reactive.js';
import { attributeHandlers, handleBind, handleEvent, handleFor, handleIf, setWalkFunction } from './handlers/index.js';

// Store references
let registeredDataFactories = {};
let stores = {};

/**
 * Set external references (called from index.js)
 */
export function setReferences(dataFactories, storeRef) {
    registeredDataFactories = dataFactories;
    stores = storeRef;
}

/**
 * Walk the DOM tree and initialize SenangStart attributes
 */
export function walk(el, parentScope = null) {
    // Skip non-element nodes
    if (el.nodeType !== 1) return;
    
    // Skip if element has ss-ignore
    if (el.hasAttribute('ss-ignore')) return;
    
    let scope = parentScope;
    
    // Check for ss-data to create new scope
    if (el.hasAttribute('ss-data')) {
        const dataExpr = el.getAttribute('ss-data').trim();
        let initialData = {};
        
        if (dataExpr) {
            // Check if it's a registered data factory
            if (registeredDataFactories[dataExpr]) {
                initialData = registeredDataFactories[dataExpr]();
            } else {
                // Parse as object literal - use Function for safety
                try {
                    initialData = new Function(`return (${dataExpr})`)();
                } catch (e) {
                    console.error('[SenangStart] Failed to parse ss-data:', dataExpr, e);
                }
            }
        }
        
        scope = {
            data: createReactive(initialData, () => {}),
            $refs: {},
            $store: stores
        };
        
        // Store scope on element for MutationObserver
        el.__ssScope = scope;
    }
    
    // If no scope, skip processing directives
    if (!scope) {
        // Still walk children in case they have ss-data
        Array.from(el.children).forEach(child => walk(child, null));
        return;
    }
    
    // Handle ss-for (must be on template element)
    if (el.tagName === 'TEMPLATE' && el.hasAttribute('ss-for')) {
        handleFor(el, el.getAttribute('ss-for'), scope);
        return; // ss-for handles its own children
    }
    
    // Handle ss-if (must be on template element)
    if (el.tagName === 'TEMPLATE' && el.hasAttribute('ss-if')) {
        handleIf(el, el.getAttribute('ss-if'), scope);
        return; // ss-if handles its own children
    }
    
    // Process all ss-* attributes
    const attributes = Array.from(el.attributes);
    
    for (const attr of attributes) {
        const name = attr.name;
        const value = attr.value;
        
        // Skip ss-data (already processed) and ss-describe (metadata only)
        if (name === 'ss-data' || name === 'ss-describe') continue;
        
        // Handle standard attributes
        if (attributeHandlers[name]) {
            attributeHandlers[name](el, value, scope);
        }
        // Handle ss-bind:[attr]
        else if (name.startsWith('ss-bind:')) {
            handleBind(el, name, value, scope);
        }
        // Handle ss-on:[event]
        else if (name.startsWith('ss-on:')) {
            handleEvent(el, name, value, scope);
        }
    }
    
    // Remove ss-cloak after processing
    if (el.hasAttribute('ss-cloak')) {
        el.removeAttribute('ss-cloak');
    }
    
    // Walk children
    Array.from(el.children).forEach(child => walk(child, scope));
}

// Set the walk function reference in directives module
setWalkFunction(walk);
