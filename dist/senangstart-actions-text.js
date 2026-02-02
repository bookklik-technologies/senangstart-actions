this.SenangStart = (function () {
    'use strict';

    /**
     * SenangStart Actions - Reactive System
     * Proxy-based reactivity with dependency tracking
     * 
     * @module reactive
     */

    // Array methods that mutate the array
    const ARRAY_MUTATING_METHODS = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'];

    // Internal state
    let pendingUpdate = false;
    const pendingEffects = new Set();
    let currentEffect = null;

    /**
     * Creates a reactive array that triggers updates on mutations
     */
    function createReactiveArray(arr, onMutate, subscribers) {
        const handler = {
            get(target, prop) {
                // Track dependency for length and numeric indices
                if (currentEffect && (prop === 'length' || !isNaN(parseInt(prop)))) {
                    if (!subscribers.has('__array__')) {
                        subscribers.set('__array__', new Set());
                    }
                    subscribers.get('__array__').add(currentEffect);
                }
                
                const value = target[prop];
                
                // Intercept mutating array methods
                if (ARRAY_MUTATING_METHODS.includes(prop) && typeof value === 'function') {
                    return function(...args) {
                        const result = Array.prototype[prop].apply(target, args);
                        
                        // Notify all array subscribers
                        if (subscribers.has('__array__')) {
                            subscribers.get('__array__').forEach(callback => {
                                pendingEffects.add(callback);
                            });
                        }
                        
                        scheduleUpdate(onMutate);
                        return result;
                    };
                }
                
                // Recursively wrap nested objects/arrays
                if (value && typeof value === 'object') {
                    if (Array.isArray(value)) {
                        return createReactiveArray(value, onMutate, subscribers);
                    } else {
                        return createReactiveObject(value, onMutate, subscribers);
                    }
                }
                
                return value;
            },
            
            set(target, prop, value) {
                const oldValue = target[prop];
                if (oldValue === value) return true;
                
                target[prop] = value;
                
                // Notify subscribers
                if (subscribers.has('__array__')) {
                    subscribers.get('__array__').forEach(callback => {
                        pendingEffects.add(callback);
                    });
                }
                
                scheduleUpdate(onMutate);
                return true;
            }
        };
        
        return new Proxy(arr, handler);
    }

    /**
     * Creates a reactive object that triggers updates on property changes
     */
    function createReactiveObject(obj, onMutate, subscribers) {
        const handler = {
            get(target, prop) {
                // Skip internal properties
                if (prop === '__subscribers' || prop === '__isReactive') {
                    return target[prop];
                }
                
                // Track dependency if we're in an effect context
                if (currentEffect) {
                    if (!subscribers.has(prop)) {
                        subscribers.set(prop, new Set());
                    }
                    subscribers.get(prop).add(currentEffect);
                }
                
                const value = target[prop];
                
                // If it's a function, bind it to the proxy
                if (typeof value === 'function') {
                    return value.bind(proxy);
                }
                
                // Recursively wrap nested objects/arrays
                if (value && typeof value === 'object') {
                    if (Array.isArray(value)) {
                        return createReactiveArray(value, onMutate, subscribers);
                    } else if (!value.__isReactive) {
                        return createReactiveObject(value, onMutate, subscribers);
                    }
                }
                
                return value;
            },
            
            set(target, prop, value) {
                const oldValue = target[prop];
                if (oldValue === value) return true;
                
                target[prop] = value;
                
                // Notify subscribers for this property
                if (subscribers.has(prop)) {
                    subscribers.get(prop).forEach(callback => {
                        pendingEffects.add(callback);
                    });
                }
                
                // Schedule batched update
                scheduleUpdate(onMutate);
                
                return true;
            },
            
            deleteProperty(target, prop) {
                delete target[prop];
                
                if (subscribers.has(prop)) {
                    subscribers.get(prop).forEach(callback => {
                        pendingEffects.add(callback);
                    });
                }
                
                scheduleUpdate(onMutate);
                return true;
            },

            ownKeys(target) {
                return Reflect.ownKeys(target).filter(key => 
                    key !== '__subscribers' && key !== '__isReactive'
                );
            }
        };
        
        const proxy = new Proxy(obj, handler);
        return proxy;
    }

    /**
     * Creates a reactive proxy that tracks dependencies and triggers updates
     */
    function createReactive(data, onUpdate) {
        const subscribers = new Map(); // property -> Set of callbacks
        
        let proxy;
        if (Array.isArray(data)) {
            proxy = createReactiveArray(data, onUpdate, subscribers);
        } else {
            proxy = createReactiveObject(data, onUpdate, subscribers);
        }
        
        proxy.__subscribers = subscribers;
        proxy.__isReactive = true;
        return proxy;
    }

    /**
     * Run an effect function while tracking its dependencies
     */
    function runEffect(fn) {
        currentEffect = fn;
        try {
            fn();
        } finally {
            currentEffect = null;
        }
    }

    /**
     * Schedule a batched DOM update
     */
    function scheduleUpdate(callback) {
        if (pendingUpdate) return;
        
        pendingUpdate = true;
        queueMicrotask(() => {
            pendingUpdate = false;
            
            // Run all pending effects
            const effects = [...pendingEffects];
            pendingEffects.clear();
            effects.forEach(effect => {
                try {
                    runEffect(effect);
                } catch (e) {
                    console.error('[SenangStart] Effect error:', e);
                }
            });
            
            if (callback) callback();
        });
    }

    /**
     * SenangStart Actions - Core Registry
     * Central registry for directives and scopes
     * 
     * @module core/registry
     */

    const registry = {
        attributes: {},    // Standard directives (ss-text, ss-show, etc.)
        structurals: {},   // Structural directives (ss-if, ss-for, etc.)
        scopes: {}};

    /**
     * Register a standard attribute directive
     * @param {string} name - Directive name (e.g., 'ss-text')
     * @param {Function} handler - Handler function
     */
    function registerAttribute(name, handler) {
        registry.attributes[name] = handler;
    }

    /**
     * Get all registered attribute handlers
     */
    function getAttributeHandlers() {
        return registry.attributes;
    }

    /**
     * Get a specific structural handler
     */
    function getStructuralHandler(name) {
        return registry.structurals[name];
    }

    /**
     * Get all registered scope handlers
     */
    function getScopeHandlers() {
        return registry.scopes;
    }

    /**
     * SenangStart Actions - DOM Walker
     * Recursive DOM traversal and initialization
     * 
     * @module walker
     */


    // Forward declaration will be set by directives module if needed, 
    // but essentially we just need to know how to walk.
    // Actually, directives (like ss-for) need to call walk.
    // So we export walk.

    /**
     * Walk the DOM tree and initialize SenangStart attributes
     */
    function walk(el, parentScope = null) {
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
        if (el.tagName === 'TEMPLATE') ;
        
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

    /**
     * SenangStart Actions - MutationObserver
     * Watch for dynamically added elements
     * 
     * @module observer
     */


    /**
     * Set up observer for dynamically added elements
     */
    function setupObserver() {
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

    /**
     * SenangStart Actions - Core Instance
     * Base framework instance without directives
     * 
     * @module core/senangstart
     */


    // =========================================================================
    // Internal State
    // =========================================================================
    const registeredDataFactories = {};  // SenangStart.data() registrations
    const stores = {};                   // SenangStart.store() registrations

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

    /**
     * SenangStart Actions - Expression Evaluator
     * Safe evaluation of expressions within component scope
     * 
     * @module evaluator
     */

    /**
     * Create a function to evaluate an expression within a component scope
     */
    function createEvaluator(expression, scope, element) {
        const { data, $refs, $store } = scope;
        
        // Magic properties
        const magics = {
            $data: data,
            $store: $store,
            $el: element,
            $my: element,
            $refs: $refs,
            $dispatch: (name, detail = {}) => {
                element.dispatchEvent(new CustomEvent(name, {
                    detail,
                    bubbles: true,
                    cancelable: true
                }));
            },
            $watch: (prop, callback) => {
                const watchEffect = () => {
                    const value = data[prop];
                    callback(value);
                };
                if (data.__subscribers) {
                    if (!data.__subscribers.has(prop)) {
                        data.__subscribers.set(prop, new Set());
                    }
                    data.__subscribers.get(prop).add(watchEffect);
                }
            },
            $nextTick: (fn) => {
                queueMicrotask(fn);
            },
            $id: (name, key) => {
                if (scope.$idRoots && scope.$idRoots[name]) {
                    return `${name}-${scope.$idRoots[name]}${key ? `-${key}` : ''}`;
                }
                return undefined;
            }
        };
        
        // Build the function with data properties spread as local variables
        const dataKeys = Object.keys(typeof data === 'object' && data !== null ? data : {});
        const magicKeys = Object.keys(magics);
        
        try {
            const fn = new Function(
                ...dataKeys,
                ...magicKeys,
                `with(this) { return (${expression}); }`
            );
            
            return function() {
                const dataValues = dataKeys.map(k => data[k]);
                const magicValues = magicKeys.map(k => magics[k]);
                return fn.call(data, ...dataValues, ...magicValues);
            };
        } catch (e) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, e);
            return () => undefined;
        }
    }

    function install() {
        registerAttribute('ss-text', (el, expr, scope) => {
            const update = () => {
                const evaluator = createEvaluator(expr, scope, el);
                el.innerText = evaluator() ?? '';
            };
            runEffect(update);
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})();
