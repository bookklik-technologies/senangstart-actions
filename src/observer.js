/**
 * SenangStart Actions - MutationObserver
 * Watch for dynamically added elements
 * 
 * @module observer
 */

import { walk } from './walker.js';

/**
 * Set up observer for dynamically added elements
 */
export function setupObserver() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    if (node.__ssScope) return;
                    
                    // Check if node or any ancestor already has scope
                    let current = node;
                    let parentScope = null;
                    
                    while (current.parentElement) {
                        current = current.parentElement;
                        if (current.__ssScope) {
                            parentScope = current.__ssScope;
                            break;
                        }
                    }
                    
                    walk(node, parentScope);
                }
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return observer;
}
