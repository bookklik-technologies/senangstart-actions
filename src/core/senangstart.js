/**
 * SenangStart Actions - Core Instance
 * Base framework instance without directives
 * 
 * @module core/senangstart
 */

import { createReactive } from '../reactive.js';
import { walk, setReferences } from '../walker.js';
import { setupObserver } from '../observer.js';

// =========================================================================
// Internal State
// =========================================================================
const registeredDataFactories = {};  // SenangStart.data() registrations
const stores = {};                   // SenangStart.store() registrations

// Set references in walker module
setReferences(registeredDataFactories, stores);

// =========================================================================
// Public API
// =========================================================================

const SenangStart = {
    /**
     * Register a reusable data component
     * @param {string} name - Component name
     * @param {Function} factory - Factory function returning data object
     */
    data(name, factory) {
        if (typeof factory !== 'function') {
            console.error('[SenangStart] data() requires a factory function');
            return this;
        }
        registeredDataFactories[name] = factory;
        return this;
    },
    
    /**
     * Register a global reactive store
     * @param {string} name - Store name
     * @param {Object} data - Store data object
     */
    store(name, data) {
        if (typeof data !== 'object') {
            console.error('[SenangStart] store() requires an object');
            return this;
        }
        stores[name] = createReactive(data, () => {});
        return this;
    },
    
    /**
     * Manually initialize a DOM tree
     * @param {Element} root - Root element to initialize
     */
    init(root = document.body) {
        walk(root, null);
        return this;
    },
    
    /**
     * Start the framework
     */
    start() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
                setupObserver();
            });
        } else {
            this.init();
            setupObserver();
        }
        return this;
    },
    
    /**
     * Version
     */
    version: '0.1.0'
};

export default SenangStart;
