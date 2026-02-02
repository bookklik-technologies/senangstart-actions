/**
 * SenangStart Actions v0.1.0
 * Declarative UI framework for humans and AI agents
 * @license MIT
 */
var SenangStart = (function () {
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

    // References for external data (passed from index.js)
    let registeredDataFactories$1 = {};
    let stores$1 = {};

    function setReferences(dataFactories, storeRef) {
        registeredDataFactories$1 = dataFactories;
        stores$1 = storeRef;
    }

    function getDataFactory(name) {
        return registeredDataFactories$1[name];
    }

    function getGlobalStores() {
        return stores$1;
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

    /**
     * Create a function to execute a statement (not return value)
     */
    function createExecutor(expression, scope, element) {
        const { data, $refs, $store } = scope;
        
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
                if (data.__subscribers) {
                    if (!data.__subscribers.has(prop)) {
                        data.__subscribers.set(prop, new Set());
                    }
                    data.__subscribers.get(prop).add(() => callback(data[prop]));
                }
            },
            $nextTick: (fn) => {
                queueMicrotask(fn);
            }
        };
        
        const dataKeys = Object.keys(typeof data === 'object' && data !== null ? data : {});
        const magicKeys = Object.keys(magics);
        
        try {
            const fn = new Function(
                ...dataKeys,
                ...magicKeys,
                `with(this) { ${expression} }`
            );
            
            return function() {
                const dataValues = dataKeys.map(k => data[k]);
                const magicValues = magicKeys.map(k => magics[k]);
                return fn.call(data, ...dataValues, ...magicValues);
            };
        } catch (e) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, e);
            return () => {};
        }
    }

    function install$e() {
        registerAttribute('ss-text', (el, expr, scope) => {
            const update = () => {
                const evaluator = createEvaluator(expr, scope, el);
                el.innerText = evaluator() ?? '';
            };
            runEffect(update);
        });
    }

    function install$d() {
        registerAttribute('ss-html', (el, expr, scope) => {
            const update = () => {
                const evaluator = createEvaluator(expr, scope, el);
                el.innerHTML = evaluator() ?? '';
            };
            runEffect(update);
        });
    }

    /**
     * Parse transition configuration from element attributes
     */
    function getTransitionConfig(el) {
        const config = {
            enter: { duration: 150, delay: 0, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', opacity: 1, scale: 1 },
            leave: { duration: 150, delay: 0, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', opacity: 1, scale: 1 }
        };
        
        const attrs = Array.from(el.attributes);
        
        attrs.forEach(attr => {
            if (!attr.name.startsWith('ss-transition')) return;
            
            const parts = attr.name.split('.');
            const mainPart = parts[0];
            let phase = 'both'; // both, enter, leave
            
            if (mainPart === 'ss-transition:enter') phase = 'enter';
            else if (mainPart === 'ss-transition:leave') phase = 'leave';
            else if (mainPart !== 'ss-transition') return;
            
            const modifiers = parts.slice(1);
            
            const applyModifier = (targetPhase) => {
                const phaseConfig = config[targetPhase];
                
                for (let i = 0; i < modifiers.length; i++) {
                    const mod = modifiers[i];
                    const nextMod = modifiers[i + 1];
                    
                    if (mod === 'duration' && nextMod) {
                        phaseConfig.duration = parseInt(nextMod.replace('ms', ''));
                        i++;
                    } else if (mod === 'delay' && nextMod) {
                        phaseConfig.delay = parseInt(nextMod.replace('ms', ''));
                        i++;
                    } else if (mod === 'opacity' && nextMod) {
                         phaseConfig.opacity = parseInt(nextMod) / 100;
                         i++;
                    } else if (mod === 'scale' && nextMod) {
                         phaseConfig.scale = parseInt(nextMod) / 100;
                         i++;
                    } else if (mod === 'easing' && nextMod) {
                         phaseConfig.easing = nextMod;
                         i++;
                    }
                }
            };
            
            if (phase === 'both') {
                applyModifier('enter');
                applyModifier('leave');
            } else {
                applyModifier(phase);
            }
        });
        
        return config;
    }

    /**
     * Handle ss-transition animations
     */
    function handleTransition(el, show, originalDisplay) {
        const config = getTransitionConfig(el);
        
        if (show) {
            // Enter
            el.style.display = originalDisplay;
            el.style.transition = 'none';
            
            const { duration, delay, easing, opacity, scale } = config.enter;
            
            const setTransition = () => {
                 el.style.transitionProperty = 'opacity, transform';
                 el.style.transitionDuration = `${duration}ms`;
                 el.style.transitionTimingFunction = easing;
                 el.style.transitionDelay = `${delay}ms`;
            };

            if (opacity < 1) el.style.opacity = 0;
            if (scale < 1) el.style.transform = `scale(${scale})`;
            
            el.classList.add('ss-enter-from');
            el.classList.add('ss-enter-active');
            
            void el.offsetHeight; // Force reflow
            
            requestAnimationFrame(() => {
                setTransition();
                el.classList.remove('ss-enter-from');
                el.classList.add('ss-enter-to');
                
                if (opacity < 1) el.style.opacity = 1;
                if (scale < 1) el.style.transform = 'scale(1)';
            });
            
            const onEnd = () => {
                el.classList.remove('ss-enter-active', 'ss-enter-to');
                el.style.transition = '';
                el.style.transitionProperty = '';
                el.style.transitionDuration = '';
                el.style.transitionTimingFunction = '';
                el.style.transitionDelay = '';
                el.style.opacity = '';
                el.style.transform = '';
                el.removeEventListener('transitionend', onEnd);
            };
            el.addEventListener('transitionend', onEnd);
        } else {
            // Leave
            el.classList.add('ss-leave-from');
            el.classList.add('ss-leave-active');
            el.style.transition = 'none';
            
            const { duration, delay, easing, opacity, scale } = config.leave;
            
            const setTransition = () => {
                 el.style.transitionProperty = 'opacity, transform';
                 el.style.transitionDuration = `${duration}ms`;
                 el.style.transitionTimingFunction = easing;
                 el.style.transitionDelay = `${delay}ms`;
            };
            
            void el.offsetHeight;
            
            requestAnimationFrame(() => {
                setTransition();
                el.classList.remove('ss-leave-from');
                el.classList.add('ss-leave-to');
                
                if (opacity < 1) el.style.opacity = 0;
                if (scale < 1) el.style.transform = `scale(${scale})`;
            });
            
            const onEnd = () => {
                el.style.display = 'none';
                el.classList.remove('ss-leave-active', 'ss-leave-to');
                el.style.transition = '';
                el.style.transitionProperty = '';
                el.style.opacity = '';
                el.style.transform = '';
                el.removeEventListener('transitionend', onEnd);
            };
            el.addEventListener('transitionend', onEnd);
        }
    }

    function install$c() {
        registerAttribute('ss-show', (el, expr, scope) => {
            const originalDisplay = el.style.display || '';
            
            const update = () => {
                const evaluator = createEvaluator(expr, scope, el);
                const show = !!evaluator();
                
                // Check for any transition attribute
                const hasTransition = Array.from(el.attributes)
                    .some(attr => attr.name.startsWith('ss-transition'));
                
                if (hasTransition) {
                    handleTransition(el, show, originalDisplay);
                } else {
                    el.style.display = show ? originalDisplay : 'none';
                }
            };
            runEffect(update);
        });
    }

    function install$b() {
        registerAttribute('ss-model', (el, expr, scope) => {
            const { data } = scope;
            
            const isCheckbox = el.type === 'checkbox';
            const isRadio = el.type === 'radio';
            const isSelect = el.tagName === 'SELECT';
            
            const setInitialValue = () => {
                const evaluator = createEvaluator(expr, scope, el);
                const value = evaluator();
                
                if (isCheckbox) {
                    el.checked = !!value;
                } else if (isRadio) {
                    el.checked = el.value === value;
                } else if (isSelect) {
                    el.value = value ?? '';
                } else {
                    el.value = value ?? '';
                }
            };
            
            runEffect(setInitialValue);
            
            const eventType = isCheckbox || isRadio ? 'change' : 'input';
            el.addEventListener(eventType, () => {
                let newValue;
                
                if (isCheckbox) {
                    newValue = el.checked;
                } else if (isRadio) {
                    if (el.checked) newValue = el.value;
                    else return;
                } else {
                    newValue = el.value;
                }
                
                data[expr] = newValue;
            });
        });
    }

    function install$a() {
        registerAttribute('ss-ref', (el, name, scope) => {
            scope.$refs[name] = el;
        });
    }

    function install$9() {
        registerAttribute('ss-init', (el, expr, scope) => {
            const executor = createExecutor(expr, scope, el);
            executor();
        });
    }

    function install$8() {
        registerAttribute('ss-effect', (el, expr, scope) => {
            const update = () => {
                const executor = createExecutor(expr, scope, el);
                executor();
            };
            runEffect(update);
        });
    }

    function install$7() {
        registerScope('ss-data', (el, expr, scope, parentScope) => {
            expr = expr.trim();
            let initialData = {};
            
            if (expr) {
                const factory = getDataFactory(expr);
                if (factory) {
                    initialData = factory();
                } else {
                    try {
                        initialData = new Function(`return (${expr})`)();
                    } catch (e) {
                        console.error('[SenangStart] Failed to parse ss-data:', expr, e);
                    }
                }
            }
            
            // ss-data creates a new scope
            const newScope = {
                data: createReactive(initialData, () => {}),
                $refs: {},
                $store: getGlobalStores() // Ensure we have access to stores
            };
            
            return newScope;
        });
    }

    function install$6() {
        registerScope('ss-id', (el, expr, scope, parentScope) => {
            const idName = expr.trim() || 'default';
            const idNameArray = idName.startsWith('[') ? new Function(`return ${idName}`)() : [idName];
            
            // Ensure scope exists
            let newScope = scope;
            if (!scope) {
               newScope = parentScope ? { ...parentScope } : { data: {}, $refs: {}, $store: getGlobalStores() };
            } else {
                 // Shallow copy to augment for this specific branch
                 newScope = { ...scope };
            }
            
            if (!newScope.$idRoots) newScope.$idRoots = {};
            
            (Array.isArray(idNameArray) ? idNameArray : [idNameArray]).forEach(name => {
                 if (!newScope.$idRoots[name]) {
                     if (!window.__ssIdCounts) window.__ssIdCounts = {};
                     if (!window.__ssIdCounts[name]) window.__ssIdCounts[name] = 0;
                     const id = ++window.__ssIdCounts[name];
                     newScope.$idRoots[name] = id;
                 }
            });
            
            return newScope;
        });
    }

    function install$5() {
        registerStructural('ss-for', (templateEl, expr, scope, walk) => {
            // Parse "item in items"
            const match = expr.match(/^\s*(?:\(([^,]+),\s*([^)]+)\)|([^\s]+))\s+in\s+(.+)$/);
            if (!match) {
                console.error('[SenangStart] Invalid ss-for expression:', expr);
                return false;
            }
            
            const itemName = (match[1] || match[3]).trim();
            const indexName = (match[2] || 'index').trim();
            const arrayExpr = match[4];
            
            const parent = templateEl.parentNode;
            const anchor = document.createComment(`ss-for: ${expr}`);
            parent.insertBefore(anchor, templateEl);
            templateEl.remove();
            
            let currentNodes = [];
            let lastItemsJSON = '';
            
            const update = () => {
                const evaluator = createEvaluator(arrayExpr, scope, templateEl);
                const items = evaluator() || [];
                
                const itemsJSON = JSON.stringify(items);
                if (itemsJSON === lastItemsJSON) return;
                lastItemsJSON = itemsJSON;
                
                currentNodes.forEach(node => node.remove());
                currentNodes = [];
                
                items.forEach((item, index) => {
                    const clone = templateEl.content.cloneNode(true);
                    const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
                    
                    const itemScope = {
                        data: createReactive({ 
                            ...scope.data, 
                            [itemName]: item, 
                            [indexName]: index 
                        }, () => {}),
                        $refs: scope.$refs,
                        $store: scope.$store,
                        parentData: scope.data
                    };
                    
                    nodes.forEach(node => {
                        parent.insertBefore(node, anchor);
                        currentNodes.push(node);
                        node.__ssScope = itemScope;
                        if (walk) walk(node, itemScope);
                    });
                });
            };
            
            runEffect(update);
            return true; // Stop walking the template element (it was removed)
        });
    }

    function install$4() {
        registerStructural('ss-if', (templateEl, expr, scope, walk) => {
            const parent = templateEl.parentNode;
            const anchor = document.createComment(`ss-if: ${expr}`);
            parent.insertBefore(anchor, templateEl);
            templateEl.remove();
            
            let currentNodes = [];
            
            const update = () => {
                const evaluator = createEvaluator(expr, scope, templateEl);
                const condition = !!evaluator();
                
                currentNodes.forEach(node => node.remove());
                currentNodes = [];
                
                if (condition) {
                    const clone = templateEl.content.cloneNode(true);
                    const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
                    
                    nodes.forEach(node => {
                        parent.insertBefore(node, anchor);
                        currentNodes.push(node);
                        if (walk) walk(node, scope);
                    });
                }
            };
            
            runEffect(update);
            return true;
        });
    }

    function install$3() {
        registerStructural('ss-teleport', (templateEl, expr, scope, walk) => {
            const targetSelector = expr;
            let target = document.querySelector(targetSelector);
            
            const anchor = document.createComment(`ss-teleport: ${targetSelector}`);
            templateEl.parentNode.insertBefore(anchor, templateEl);
            templateEl.remove();
            
            if (!target) {
                console.warn(`[SenangStart] ss-teleport target not found: ${targetSelector}`);
                return true;
            }
            
            const clone = templateEl.content.cloneNode(true);
            const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
            
            nodes.forEach(node => {
                target.appendChild(node);
                if (walk) walk(node, scope);
            });
            
            return true;
        });
    }

    function install$2() {
        registerAttribute('ss-bind', (el, attrName, expr, scope) => {
            const attr = attrName.replace('ss-bind:', '');
            
            const update = () => {
                const evaluator = createEvaluator(expr, scope, el);
                const value = evaluator();
                
                if (attr === 'class') {
                    if (typeof value === 'string') {
                        el.className = value;
                    } else if (typeof value === 'object') {
                        Object.entries(value).forEach(([className, condition]) => {
                            el.classList.toggle(className, !!condition);
                        });
                    }
                } else if (attr === 'style') {
                    if (typeof value === 'string') {
                        el.style.cssText = value;
                    } else if (typeof value === 'object') {
                        Object.assign(el.style, value);
                    }
                } else if (value === false || value === null || value === undefined) {
                    el.removeAttribute(attr);
                } else if (value === true) {
                    el.setAttribute(attr, '');
                } else {
                    el.setAttribute(attr, value);
                }
            };
            
            runEffect(update);
        });
    }

    function install$1() {
        registerAttribute('ss-on', (el, attrName, expr, scope) => {
            const parts = attrName.replace('ss-on:', '').split('.');
            const eventName = parts[0];
            const modifiers = parts.slice(1);
            
            const executor = createExecutor(expr, scope, el);
            
            const handler = (event) => {
                if (modifiers.includes('prevent')) event.preventDefault();
                if (modifiers.includes('stop')) event.stopPropagation();
                if (modifiers.includes('self') && event.target !== el) return;
                if (modifiers.includes('once')) {
                    el.removeEventListener(eventName, handler);
                }
                
                if (event instanceof KeyboardEvent) {
                    const key = event.key.toLowerCase();
                    const keyModifiers = ['enter', 'escape', 'tab', 'space', 'up', 'down', 'left', 'right'];
                    const hasKeyModifier = modifiers.some(m => keyModifiers.includes(m));
                    
                    if (hasKeyModifier) {
                        const keyMap = {
                            'enter': 'enter',
                            'escape': 'escape',
                            'tab': 'tab',
                            'space': ' ',
                            'up': 'arrowup',
                            'down': 'arrowdown',
                            'left': 'arrowleft',
                            'right': 'arrowright'
                        };
                        
                        const shouldFire = modifiers.some(m => keyMap[m] === key);
                        if (!shouldFire) return;
                    }
                }
                
                scope.data.$event = event;
                executor();
                delete scope.data.$event;
            };
            
            if (modifiers.includes('window')) {
                window.addEventListener(eventName, handler);
            } else if (modifiers.includes('document')) {
                document.addEventListener(eventName, handler);
            } else {
                el.addEventListener(eventName, handler);
            }
        });
    }

    function install() {
        // Inject style
        if (typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.textContent = '[ss-cloak] { display: none !important; }';
            document.head.appendChild(style);
        }

        registerAttribute('ss-cloak', (el, expr, scope) => {
            el.removeAttribute('ss-cloak');
        });
    }

    /**
     * SenangStart Actions v0.1.0
     * Declarative UI framework for humans and AI agents
     * 
     * @license MIT
     * @author Bookklik
     * @module senangstart-actions
     */


    // Install all
    install$e();
    install$d();
    install$c();
    install$b();
    install$a();
    install$9();
    install$8();
    install$7();
    install$6();
    install$5();
    install$4();
    install$3();
    install$2();
    install$1();
    install();

    // Auto-start
    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})();
