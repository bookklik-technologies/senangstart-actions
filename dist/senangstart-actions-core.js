var SenangStart = (function () {
    'use strict';

    /**
     * SenangStart Actions - Core Registry
     * Central registry for directives and scopes
     * 
     * @module core/registry
     */

    const registry = {
        attributes: Object.create(null),
        structurals: Object.create(null),
        scopes: Object.create(null)};

    /**
     * Register a standard attribute directive
     * @param {string} name - Directive name (e.g., 'ss-text')
     * @param {Function} handler - Handler function
     */
    function registerAttribute(name, handler) {
        registry.attributes[name] = handler;
    }

    /**
     * Register a structural directive
     * @param {string} name - Directive name (e.g., 'ss-if')
     * @param {Function} handler - Handler function
     */
    function registerStructural(name, handler) {
        registry.structurals[name] = handler;
    }

    /**
     * Register a scope directive
     * @param {string} name - Directive name (e.g., 'ss-data')
     * @param {Function} handler - Handler function that returns scope data
     */
    function registerScope(name, handler) {
        registry.scopes[name] = handler;
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
     * Get a specific scope handler
     */
    function getScopeHandler(name) {
        return registry.scopes[name];
    }

    /**
     * Get all registered scope handlers
     */
    function getScopeHandlers() {
        return registry.scopes;
    }

    var registry$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getAttributeHandlers: getAttributeHandlers,
        getScopeHandler: getScopeHandler,
        getScopeHandlers: getScopeHandlers,
        getStructuralHandler: getStructuralHandler,
        registerAttribute: registerAttribute,
        registerScope: registerScope,
        registerStructural: registerStructural
    });

    const iterationKey = Symbol('iteration');
    const proxyMetadata = new WeakMap();
    const effectDependencies = new WeakMap();
    const ownedEffects = new WeakMap();
    const stoppedEffects = new WeakSet();
    const pendingCallbacks = new Set();
    let pendingUpdate = false;

    const pendingEffects = new Set();
    let currentEffect = null;

    function track(subscribers, property) {
        if (!currentEffect) return;
        if (!subscribers.has(property)) subscribers.set(property, new Set());
        const dependencies = subscribers.get(property);
        dependencies.add(currentEffect);
        effectDependencies.get(currentEffect)?.add(dependencies);
    }

    function createReactive$1(data, onUpdate) {
        if (!data || typeof data !== 'object') {
            throw new TypeError('[SenangStart] Reactive data must be an object or array');
        }
        const cache = new WeakMap();

        const wrap = (target) => {
            if (!target || typeof target !== 'object') return target;
            if (proxyMetadata.has(target)) return target;
            const prototype = Object.getPrototypeOf(target);
            if (!Array.isArray(target) && prototype !== Object.prototype && prototype !== null) return target;
            if (cache.has(target)) return cache.get(target);

            const subscribers = new Map();
            const boundMethods = new Map();
            const notify = (properties) => {
                properties.forEach(property => {
                    subscribers.get(property)?.forEach(effect => pendingEffects.add(effect));
                });
                scheduleUpdate(onUpdate);
            };

            const proxy = new Proxy(target, {
                get(object, property, receiver) {
                    if (property === '__isReactive') return true;
                    if (property === '__subscribers') return subscribers;
                    track(subscribers, property);
                    const value = Reflect.get(object, property, receiver);
                    const descriptor = Reflect.getOwnPropertyDescriptor(object, property);
                    if (descriptor && !descriptor.configurable && descriptor.writable === false) return value;
                    if (typeof value === 'function' && !Array.isArray(object)) {
                        if (!boundMethods.has(value)) boundMethods.set(value, value.bind(receiver));
                        return boundMethods.get(value);
                    }
                    return wrap(value);
                },
                has(object, property) {
                    track(subscribers, property);
                    return Reflect.has(object, property);
                },
                ownKeys(object) {
                    track(subscribers, iterationKey);
                    return Reflect.ownKeys(object);
                },
                set(object, property, value, receiver) {
                    const hadProperty = Object.hasOwn(object, property);
                    const oldValue = object[property];
                    const oldLength = Array.isArray(object) ? object.length : 0;
                    const rawValue = proxyMetadata.get(value)?.target ?? value;
                    if (!Reflect.set(object, property, rawValue, receiver)) return false;
                    if (hadProperty && Object.is(oldValue, rawValue)) return true;

                    const properties = new Set([property]);
                    if (!hadProperty) properties.add(iterationKey);
                    if (Array.isArray(object)) {
                        if (object.length !== oldLength) properties.add('length');
                        if (property === 'length' && object.length < oldLength) {
                            properties.add(iterationKey);
                            subscribers.forEach((effects, key) => {
                                if (typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key) && Number(key) >= object.length) {
                                    properties.add(key);
                                }
                            });
                        }
                    }
                    notify(properties);
                    return true;
                },
                deleteProperty(object, property) {
                    const hadProperty = Object.hasOwn(object, property);
                    if (!Reflect.deleteProperty(object, property)) return false;
                    if (hadProperty) notify(new Set([property, iterationKey]));
                    return true;
                }
            });

            cache.set(target, proxy);
            proxyMetadata.set(proxy, { target });
            return proxy;
        };

        return wrap(data);
    }

    function cleanupTree(node) {
        ownedEffects.get(node)?.forEach(effect => {
            stoppedEffects.add(effect);
            pendingEffects.delete(effect);
            effectDependencies.get(effect)?.forEach(dependencies => dependencies.delete(effect));
            effectDependencies.delete(effect);
        });
        ownedEffects.delete(node);
        node.__ssOnCleanup?.splice(0).forEach(cleanup => cleanup());
        Array.from(node.childNodes || []).forEach(cleanupTree);
        delete node.__ssInitialized;
    }

    function runEffect(fn, owner) {
        if (stoppedEffects.has(fn)) return;
        if (owner) {
            if (!ownedEffects.has(owner)) ownedEffects.set(owner, new Set());
            ownedEffects.get(owner).add(fn);
        }
        effectDependencies.get(fn)?.forEach(dependencies => dependencies.delete(fn));
        effectDependencies.set(fn, new Set());
        const previousEffect = currentEffect;
        currentEffect = fn;
        try {
            return fn();
        } finally {
            currentEffect = previousEffect;
        }
    }

    function scheduleUpdate(callback) {
        if (typeof callback === 'function') pendingCallbacks.add(callback);
        if (pendingUpdate) return;
        pendingUpdate = true;
        queueMicrotask(() => {
            pendingUpdate = false;
            const effects = [...pendingEffects];
            const callbacks = [...pendingCallbacks];
            pendingEffects.clear();
            pendingCallbacks.clear();
            effects.forEach(effect => {
                try {
                    runEffect(effect);
                } catch (error) {
                    console.error('[SenangStart] Effect error:', error);
                }
            });
            callbacks.forEach(update => {
                try {
                    update();
                } catch (error) {
                    console.error('[SenangStart] Update error:', error);
                }
            });
        });
    }

    var reactive = /*#__PURE__*/Object.freeze({
        __proto__: null,
        cleanupTree: cleanupTree,
        createReactive: createReactive$1,
        get currentEffect () { return currentEffect; },
        pendingEffects: pendingEffects,
        runEffect: runEffect,
        scheduleUpdate: scheduleUpdate
    });

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
    function walk$1(el, parentScope = null) {
        // Skip non-element nodes
        if (!el || el.nodeType !== 1 || el.__ssInitialized) return;
        
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
            Array.from(el.children).forEach(child => walk$1(child, null));
            return;
        }

        el.__ssInitialized = true;
        
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
                if (structuralHandler(el, attr.value, scope, walk$1) === false) {
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
        
        Array.from(el.children).forEach(child => walk$1(child, scope));
    }

    // References for external data (passed from index.js)
    let registeredDataFactories$1 = {};
    let stores$1 = {};

    function setReferences$1(dataFactories, storeRef) {
        registeredDataFactories$1 = dataFactories;
        stores$1 = storeRef;
    }

    // Helpers for scope handlers to access global stores/factories
    function getStore(name) {
        return Object.hasOwn(stores$1, name) ? stores$1[name] : undefined;
    }

    function getDataFactory(name) {
        return Object.hasOwn(registeredDataFactories$1, name) ? registeredDataFactories$1[name] : undefined;
    }

    function getGlobalStores() {
        return stores$1;
    }

    var walker = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getDataFactory: getDataFactory,
        getGlobalStores: getGlobalStores,
        getStore: getStore,
        setReferences: setReferences$1,
        walk: walk$1
    });

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
                for (const node of mutation.removedNodes) {
                    if (!node.isConnected) cleanupTree(node);
                }
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.__ssInitialized || !node.isConnected) continue;
                        
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
                        
                        walk$1(node, parentScope);
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


    const { createReactive } = reactive;
    const { walk, setReferences } = walker;

    // =========================================================================
    // Internal State
    // =========================================================================
    const registeredDataFactories = Object.create(null);
    const stores = Object.create(null);

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
            if (!data || typeof data !== 'object') {
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
            if (typeof document === 'undefined') return this;
            if (this.isStarted) return this;
            this.isStarted = true;

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
        version: '0.1.7',

        /**
         * Internal APIs exposed for modular directives
         */
        internals: {
            registry: registry$1,
            reactive,
            walker
        }
    };

    return SenangStart;

})();
