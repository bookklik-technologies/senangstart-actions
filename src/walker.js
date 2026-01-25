/**
 * SenangStart Actions - DOM Walker
 * Recursive DOM traversal and initialization
 * 
 * @module walker
 */

import { createReactive } from './reactive.js';
import { attributeHandlers, handleBind, handleEvent, handleFor, handleIf, handleTeleport, setWalkFunction } from './handlers/index.js';

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

    // Handle ss-id (create ID scope)
    if (el.hasAttribute('ss-id')) {
        const idName = el.getAttribute('ss-id').trim() || 'default';
        const idNameArray = idName.startsWith('[') ? new Function(`return ${idName}`)() : [idName];
        
        // Ensure scope exists (if no ss-data was present)
        if (!scope) {
           scope = parentScope ? { ...parentScope } : { data: {}, $refs: {}, $store: stores };
        } else {
             // Create a new scope object inheriting from the current one to strictly scope the IDs?
             // Or just augment the current scope? 
             // Ideally we want to attach the id info to the scope chain.
             // Let's create a child scope if we already have one, or just use it.
             scope = { ...scope };
        }
        
        // Initialize ID registry in scope if not present
        if (!scope.$idRoots) scope.$idRoots = {};
        
        // For each name in ss-id, generate a unique ID
        // Actually, ss-id declaratively says "this is a root for IDs of type X"
        // Alpine: x-id="['text-input']"
        // And then $id('text-input') returns "text-input-1" (stable for this instance)
        
        (Array.isArray(idNameArray) ? idNameArray : [idNameArray]).forEach(name => {
             // Find next available ID for this name globally or within some context?
             // Alpine uses a global incrementor but scoped retrieval.
             // We need to store the "id state" on the element or scope.
             if (!scope.$idRoots[name]) {
                 // We need a global counter for 'name' to ensure uniqueness across the page?
                 // Or just random? Alpine makes them stable if possible.
                 // Simple implementation:
                 if (!window.__ssIdCounts) window.__ssIdCounts = {};
                 if (!window.__ssIdCounts[name]) window.__ssIdCounts[name] = 0;
                 const id = ++window.__ssIdCounts[name];
                 scope.$idRoots[name] = id;
             }
        });
        
        // Update scope on element since we modified/forked it
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

    // Handle ss-teleport (must be on template element)
    if (el.tagName === 'TEMPLATE' && el.hasAttribute('ss-teleport')) {
        handleTeleport(el, el.getAttribute('ss-teleport'), scope);
        return; 
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
