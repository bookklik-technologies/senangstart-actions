/**
 * SenangStart Actions - DOM Walker
 * Recursive DOM traversal and initialization
 * 
 * @module walker
 */

import { createReactive } from './reactive.js';
import { 
    getAttributeHandlers, 
    getStructuralHandler, 
    getScopeHandlers 
} from './core/registry.js';

// Forward declaration will be set by directives module if needed, 
// but essentially we just need to know how to walk.
// Actually, directives (like ss-for) need to call walk.
// So we export walk.

/**
 * Walk the DOM tree and initialize SenangStart attributes
 */
export function walk(el, parentScope = null) {
    // Skip non-element nodes
    if (el.nodeType !== 1) return;
    
    // Skip if element has ss-ignore
    if (el.hasAttribute('ss-ignore')) return;
    
    let scope = parentScope;
    
    // 1. Handle Scope Generators (ss-data, ss-id)
    // We iterate over registered scope handlers. 
    // Order might matter? ss-data creates the scope, ss-id augments it.
    // Let's assume registration order or simple iteration.
    // For now, let's look for specific known scope creators or iterate?
    // Iteration is cleaner for extensibility.
    
    const scopeHandlers = getScopeHandlers();
    for (const [name, handler] of Object.entries(scopeHandlers)) {
        if (el.hasAttribute(name)) {
            const expr = el.getAttribute(name);
            scope = handler(el, expr, scope, parentScope);
            
            // Allow handler to stop processing if needed? 
            // Usually scope handlers just return a new/augmented scope.
            // We assign it to scope.
        }
    }
    
    // Store scope on element if changed or just always?
    // Only if we created/modified scope? 
    // Existing logic put it on `el.__ssScope`.
    if (scope !== parentScope && scope) {
        el.__ssScope = scope;
    }

    // If no scope, can we skip?
    if (!scope) {
        Array.from(el.children).forEach(child => walk(child, null));
        return;
    }
    
    // 2. Handle Structural Directives (change DOM structure: ss-if, ss-for, ss-teleport)
    // These must run before other attributes and might stop traversal of current node.
    
    // We can't easily iterate because order matters (scoping) and they manipulate DOM.
    // Usually they are on <template> tags.
    if (el.tagName === 'TEMPLATE') {
        // We check for specific structural directives. 
        // We can iterate registered structural directives?
        // But what if multiple are present? 
        // Vue/Alpine usually have precedence. 
        // Let's iterate but prioritize? Or just one allowed?
        // For now, just finding the first matching one is probably safe enough for this refactor.
        
        // However, `getStructuralHandler` returns a specific one.
        // We probably want to check `attributes` of the element against registered structurals.
    }
    
    // Check for structural directives on the element
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
        const structuralHandler = getStructuralHandler(attr.name);
        if (structuralHandler) {
            if (structuralHandler(el, attr.value, scope, walk) === false) {
                 // specific return value to indicate "stop walking this node" (it was removed/replaced)
                 return;
            }
            // Some structurals (like ss-teleport) might remove the element, so we return.
            // If they don't remove (unlikely for template structurals?), we continue?
            // Existing logic: ss-for/if/teleport all return immediately.
            return;
        }
    }
    
    // 3. Handle Standard Attributes (ss-text, ss-bind, etc.)
    const attributeHandlers = getAttributeHandlers();
    
    // Re-scanning attributes in case structural didn't trigger
    for (const attr of Array.from(el.attributes)) {
        const name = attr.name;
        const value = attr.value;
        
        // Exact match handler
        if (attributeHandlers[name]) {
            attributeHandlers[name](el, value, scope);
            continue;
        }
        
        // Prefix match handlers (ss-bind:, ss-on:)
        // We need a way to register "prefix" handlers or wildcards?
        // The registry has `attributes` which are exact matches.
        // We might need `modifiers` or `patterns` in registry?
        // For now, I'll keep the wildcard logic here but use registered handlers if I can, 
        // or just hardcode the "dispatch" to the registered 'ss-bind' / 'ss-on' if they are registered as such?
        // 
        // Implementation Plan said: "Extract ss-bind, ss-on".
        // They should probably be registered as `ss-bind` and `ss-on` and we check for prefix.
        
        // Actually, let's iterate handlers and see if they match? 
        // Optimization: Check if attr name starts with known prefixes?
        // Better: register 'ss-bind' and 'ss-on' in the registry. 
        // But the attribute name on element is `ss-bind:foo`, not `ss-bind`.
        // So `attributeHandlers['ss-bind']` won't match.
        
        // We can handle this by checking if any registered handler "matches" the attribute.
        // But that's O(N*M).
        // 
        // Alternative: The registry could support regex or prefix keys.
        // Or we just check for the common colon pattern.
        
        const colonIndex = name.indexOf(':');
        if (colonIndex > -1) {
            const prefix = name.substring(0, colonIndex);
            if (attributeHandlers[prefix]) {
                attributeHandlers[prefix](el, name, value, scope);
            }
        }
    }
    
    // 4. Recursively walk children
    // (Unless structural directive stopped us, which we returned above)
    
    // Note: ss-cloak handling will be a registered attribute handler now
    
    Array.from(el.children).forEach(child => walk(child, scope));
}

// References for external data (passed from index.js)
let registeredDataFactories = {};
let stores = {};

export function setReferences(dataFactories, storeRef) {
    registeredDataFactories = dataFactories;
    stores = storeRef;
}

// Helpers for scope handlers to access global stores/factories
export function getStore(name) {
    return stores[name];
}

export function getDataFactory(name) {
    return registeredDataFactories[name];
}

export function getGlobalStores() {
    return stores;
}
