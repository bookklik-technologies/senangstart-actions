/**
 * SenangStart Actions - Core Registry
 * Central registry for directives and scopes
 * 
 * @module core/registry
 */

const registry = {
    attributes: {},    // Standard directives (ss-text, ss-show, etc.)
    structurals: {},   // Structural directives (ss-if, ss-for, etc.)
    scopes: {},        // Scope-creating directives (ss-data, ss-id)
    modifiers: {}      // Attribute modifiers
};

/**
 * Register a standard attribute directive
 * @param {string} name - Directive name (e.g., 'ss-text')
 * @param {Function} handler - Handler function
 */
export function registerAttribute(name, handler) {
    registry.attributes[name] = handler;
}

/**
 * Register a structural directive
 * @param {string} name - Directive name (e.g., 'ss-if')
 * @param {Function} handler - Handler function
 */
export function registerStructural(name, handler) {
    registry.structurals[name] = handler;
}

/**
 * Register a scope directive
 * @param {string} name - Directive name (e.g., 'ss-data')
 * @param {Function} handler - Handler function that returns scope data
 */
export function registerScope(name, handler) {
    registry.scopes[name] = handler;
}

/**
 * Get all registered attribute handlers
 */
export function getAttributeHandlers() {
    return registry.attributes;
}

/**
 * Get a specific structural handler
 */
export function getStructuralHandler(name) {
    return registry.structurals[name];
}

/**
 * Get a specific scope handler
 */
export function getScopeHandler(name) {
    return registry.scopes[name];
}

/**
 * Get all registered scope handlers
 */
export function getScopeHandlers() {
    return registry.scopes;
}
