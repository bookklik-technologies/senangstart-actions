/**
 * SenangStart Actions v0.1.7
 * Declarative UI framework for humans and AI agents
 * @license MIT
 */
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

function createMagics(scope, element) {
    const { data, $refs, $store } = scope;
    return {
        $data: data,
        $store,
        $el: element,
        $my: element,
        $refs,
        $dispatch: (name, detail = {}) => element.dispatchEvent(new CustomEvent(name, {
            detail,
            bubbles: true,
            cancelable: true
        })),
        $watch: (property, callback) => {
            let previousValue;
            let initialized = false;
            runEffect(() => {
                const value = data[property];
                if (initialized && !Object.is(value, previousValue)) {
                    const oldValue = previousValue;
                    previousValue = value;
                    queueMicrotask(() => callback(value, oldValue));
                } else {
                    previousValue = value;
                    initialized = true;
                }
            }, element);
        },
        $nextTick: (callback) => queueMicrotask(callback),
        $id: (name, key) => {
            const root = scope.$idRoots && Object.hasOwn(scope.$idRoots, name) ? scope.$idRoots[name] : undefined;
            if (!root) return undefined;
            return `${name}-${root}${key !== undefined && key !== null ? `-${key}` : ''}`;
        }
    };
}

function compile(expression, scope, element, statement) {
    const magics = createMagics(scope, element);
    try {
        const body = statement ? expression : `return (${expression});`;
        const evaluate = new Function('$scope', '$magics', '$locals',
            `with ($magics) { with ($scope) { with ($locals) { ${body} } } }`);
        return (locals = {}) => evaluate.call(scope.data, scope.data, magics, locals);
    } catch (error) {
        console.error(`[SenangStart] Failed to parse expression: ${expression}`, error);
        return () => undefined;
    }
}

function createEvaluator(expression, scope, element) {
    return compile(expression, scope, element, false);
}

function createExecutor(expression, scope, element) {
    return compile(expression, scope, element, true);
}

function handleText(el, expr, scope) {
    const evaluate = createEvaluator(expr, scope, el);
    runEffect(() => {
        el.innerText = evaluate() ?? '';
    }, el);
}

function install$e() {
    registerAttribute('ss-text', handleText);
}

function handleHtml(el, expr, scope) {
    const evaluate = createEvaluator(expr, scope, el);
    runEffect(() => {
        el.innerHTML = evaluate() ?? '';
    }, el);
}

function install$d() {
    registerAttribute('ss-html', handleHtml);
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

function handleShow(el, expr, scope) {
    const originalDisplay = el.style.display || '';
    const evaluate = createEvaluator(expr, scope, el);
    runEffect(() => {
        const show = !!evaluate();
        const hasTransition = Array.from(el.attributes).some(attr => attr.name.startsWith('ss-transition'));
        if (hasTransition) handleTransition(el, show, originalDisplay);
        else el.style.display = show ? originalDisplay : 'none';
    }, el);
}

function install$c() {
    registerAttribute('ss-show', handleShow);
}

function handleModel(el, expr, scope) {
    const isCheckbox = el.type === 'checkbox';
    const isRadio = el.type === 'radio';
    const isSelect = el.tagName === 'SELECT';
    const evaluate = createEvaluator(expr, scope, el);
    const assign = createExecutor(`${expr} = $value`, scope, el);

    runEffect(() => {
        const value = evaluate();
        if (isCheckbox) {
            el.checked = !!value;
        } else if (isRadio) {
            el.checked = el.value === value;
        } else {
            el.value = value ?? '';
        }
    }, el);

    const eventType = isCheckbox || isRadio || isSelect ? 'change' : 'input';
    const onInput = () => {
        if (isRadio && !el.checked) return;
        assign({ $value: isCheckbox ? el.checked : el.value });
    };
    el.addEventListener(eventType, onInput);
    el.__ssOnCleanup = el.__ssOnCleanup || [];
    el.__ssOnCleanup.push(() => el.removeEventListener(eventType, onInput));
}

function install$b() {
    registerAttribute('ss-model', handleModel);
}

function handleRef(el, name, scope) {
    scope.$refs[name] = el;
    el.__ssOnCleanup = el.__ssOnCleanup || [];
    el.__ssOnCleanup.push(() => {
        if (scope.$refs[name] === el) delete scope.$refs[name];
    });
}

function install$a() {
    registerAttribute('ss-ref', handleRef);
}

function handleInit(el, expr, scope) {
    createExecutor(expr, scope, el)();
}

function install$9() {
    registerAttribute('ss-init', handleInit);
}

function handleEffect(el, expr, scope) {
    const execute = createExecutor(expr, scope, el);
    runEffect(() => execute(), el);
}

function install$8() {
    registerAttribute('ss-effect', handleEffect);
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
            data: createReactive$1(initialData, () => {}),
            $refs: {},
            $store: getGlobalStores() // Ensure we have access to stores
        };
        
        return newScope;
    });
}

function install$6() {
    registerScope('ss-id', (el, expr, scope, parentScope) => {
        const idName = expr.trim() || 'default';
        const names = idName.startsWith('[') ? new Function(`return ${idName}`)() : [idName];
        const newScope = scope ? { ...scope } : {
            data: {}, $refs: {}, $store: getGlobalStores()
        };
        newScope.$idRoots = { ...scope?.$idRoots };
        window.__ssIdCounts = window.__ssIdCounts || {};

        (Array.isArray(names) ? names : [names]).forEach(name => {
            const previous = Object.hasOwn(window.__ssIdCounts, name) ? window.__ssIdCounts[name] : 0;
            const id = previous + 1;
            Object.defineProperty(window.__ssIdCounts, name, {
                value: id, writable: true, configurable: true, enumerable: true
            });
            Object.defineProperty(newScope.$idRoots, name, {
                value: id, writable: true, configurable: true, enumerable: true
            });
        });
        return newScope;
    });
}

function createRegion(templateEl, label) {
    const parent = templateEl.parentNode;
    const start = document.createTextNode('');
    const anchor = document.createComment(label);
    parent.insertBefore(start, templateEl);
    parent.insertBefore(anchor, templateEl);
    templateEl.remove();

    const clear = () => {
        while (start.nextSibling && start.nextSibling !== anchor) {
            const node = start.nextSibling;
            cleanupTree(node);
            node.remove();
        }
    };
    anchor.__ssOnCleanup = [() => {
        clear();
        start.remove();
    }];
    return { parent, anchor, clear };
}

function handleFor(templateEl, expr, scope, walk) {
    if (templateEl.tagName !== 'TEMPLATE') {
        console.error('[SenangStart] ss-for requires a template element');
        return false;
    }
    const match = expr.match(/^\s*(?:\(([^,]+),\s*([^)]+)\)|([^\s]+))\s+in\s+(.+)$/);
    if (!match) {
        console.error('[SenangStart] Invalid ss-for expression:', expr);
        return false;
    }
    const itemName = (match[1] || match[3]).trim();
    const indexName = (match[2] || 'index').trim();
    const { parent, anchor, clear } = createRegion(templateEl, `ss-for: ${expr}`);
    const evaluate = createEvaluator(match[4], scope, templateEl);

    runEffect(() => {
        const items = evaluate() ?? [];
        if (!Array.isArray(items)) {
            console.error('[SenangStart] ss-for requires an array:', expr);
            return;
        }
        clear();

        items.forEach((item, index) => {
            const localData = createReactive$1({ [itemName]: item, [indexName]: index }, () => {});
            const data = new Proxy(localData, {
                has(target, property) {
                    return Reflect.has(target, property) || Reflect.has(scope.data, property);
                },
                get(target, property, receiver) {
                    if (property === '__isReactive' || property === '__subscribers' || Reflect.has(target, property)) {
                        return Reflect.get(target, property, receiver);
                    }
                    return scope.data[property];
                },
                set(target, property, value) {
                    if (Object.hasOwn(target, property) || !Reflect.has(scope.data, property)) {
                        return Reflect.set(target, property, value);
                    }
                    return Reflect.set(scope.data, property, value);
                }
            });
            const itemScope = { ...scope, data, parentData: scope.data };
            const clone = templateEl.content.cloneNode(true);
            Array.from(clone.childNodes).forEach(node => {
                parent.insertBefore(node, anchor);
                if (node.nodeType === 1) {
                    node.__ssScope = itemScope;
                    if (walk) walk(node, itemScope);
                }
            });
        });
    }, anchor);
    return true;
}

function install$5() {
    registerStructural('ss-for', handleFor);
}

function handleIf(templateEl, expr, scope, walk) {
    if (templateEl.tagName !== 'TEMPLATE') {
        console.error('[SenangStart] ss-if requires a template element');
        return false;
    }
    const { parent, anchor, clear } = createRegion(templateEl, `ss-if: ${expr}`);
    const evaluate = createEvaluator(expr, scope, templateEl);
    let previousCondition;

    runEffect(() => {
        const condition = !!evaluate();
        if (condition === previousCondition) return;
        previousCondition = condition;
        clear();
        if (!condition) return;

        const clone = templateEl.content.cloneNode(true);
        const currentNodes = Array.from(clone.childNodes);
        currentNodes.forEach(node => {
            parent.insertBefore(node, anchor);
            if (node.nodeType === 1 && walk) walk(node, scope);
        });
    }, anchor);
    return true;
}

function install$4() {
    registerStructural('ss-if', handleIf);
}

function handleTeleport(templateEl, expr, scope, walk) {
    if (templateEl.tagName !== 'TEMPLATE') {
        console.error('[SenangStart] ss-teleport requires a template element');
        return false;
    }
    const target = document.querySelector(expr);
    const anchor = document.createComment(`ss-teleport: ${expr}`);
    templateEl.parentNode.insertBefore(anchor, templateEl);
    templateEl.remove();
    if (!target) {
        console.warn(`[SenangStart] ss-teleport target not found: ${expr}`);
        return true;
    }
    const clone = templateEl.content.cloneNode(true);
    const nodes = Array.from(clone.childNodes);
    anchor.__ssOnCleanup = [() => nodes.forEach(node => {
        cleanupTree(node);
        node.remove();
    })];

    nodes.forEach(node => {
        target.appendChild(node);
        if (node.nodeType === 1) {
            node.__ssScope = scope;
            if (walk) walk(node, scope);
        }
    });
    return true;
}

function install$3() {
    registerStructural('ss-teleport', handleTeleport);
}

function handleBind(el, attrName, expr, scope) {
    const attr = attrName.replace('ss-bind:', '');
    const evaluate = createEvaluator(expr, scope, el);
    const previousClasses = new Map();
    const previousStyles = new Map();

    runEffect(() => {
        const value = evaluate();
        if (attr === 'class') {
            previousClasses.forEach((present, name) => el.classList.toggle(name, present));
            previousClasses.clear();
            const classes = typeof value === 'string' ? { [value]: true } : value;
            if (!classes || typeof classes !== 'object') return;
            Object.entries(classes).forEach(([names, condition]) => {
                names.split(/\s+/).filter(Boolean).forEach(name => {
                    if (!previousClasses.has(name)) previousClasses.set(name, el.classList.contains(name));
                    el.classList.toggle(name, !!condition);
                });
            });
        } else if (attr === 'style') {
            previousStyles.forEach(([original, priority], name) => {
                if (original) el.style.setProperty(name, original, priority);
                else el.style.removeProperty(name);
            });
            previousStyles.clear();
            let styles = value;
            let parsed;
            if (typeof value === 'string') {
                parsed = document.createElement('div').style;
                parsed.cssText = value;
                styles = Object.fromEntries(Array.from(parsed).map(name => [name, parsed.getPropertyValue(name)]));
            }
            if (!styles || typeof styles !== 'object') return;
            Object.entries(styles).forEach(([property, setting]) => {
                const name = property.startsWith('--') ? property : property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                previousStyles.set(name, [el.style.getPropertyValue(name), el.style.getPropertyPriority(name)]);
                el.style.setProperty(name, setting ?? '', parsed?.getPropertyPriority(name) ?? '');
            });
        } else if (value === false || value === null || value === undefined) {
            el.removeAttribute(attr);
        } else {
            el.setAttribute(attr, value === true ? '' : value);
        }
    }, el);
}

function install$2() {
    registerAttribute('ss-bind', handleBind);
}

/**
 * SenangStart Actions - Event Handler
 * Centralized handler for ss-on:[event] with full modifier support.
 * 
 * @module handlers/events
 */


/**
 * Handle ss-on:[event] dynamically.
 * Returns a function that removes the listener.
 */
function handleEvent(el, attrName, expr, scope) {
    let spec = attrName.replace(/^ss-on:?(.*)$/, '$1');
    const rawParts = spec.split('.');
    let event = rawParts[0];
    const modifiers = rawParts.slice(1);
    const optionsRef = {};

    let listenerTarget = el;

    let active = true;
    let handler = (e) => {
        if (active) invoke(e);
    };

    // This little helper allows us to add functionality to the listener's
    // handler more flexibly in a "middleware" style.
    const wrapHandler = (callback, wrapper) => (e) => wrapper(callback, e);

    if (modifiers.includes('dot')) event = dotSyntax(event);
    if (modifiers.includes('camel')) event = camelCase(event);
    if (modifiers.includes('capture')) optionsRef.capture = true;
    if (modifiers.includes('window')) { listenerTarget = window; }
    if (modifiers.includes('document')) { listenerTarget = document; }

    if (modifiers.includes('passive')) {
        optionsRef.passive = modifiers[modifiers.indexOf('passive') + 1] !== 'false';
    }

    // By wrapping the handler with debounce & throttle first, we ensure that the wrapping logic itself
    // is not throttled/debounced, only the user's callback is.
    handler = addDebounceOrThrottle(modifiers, handler);

    if (modifiers.includes('prevent')) handler = wrapHandler(handler, (next, e) => { e.preventDefault(); next(e); });
    if (modifiers.includes('stop')) handler = wrapHandler(handler, (next, e) => { e.stopPropagation(); next(e); });

    if (modifiers.includes('once')) {
        handler = wrapHandler(handler, (next, e) => {
            next(e);
            listenerTarget.removeEventListener(event, handler, optionsRef);
        });
    }

    if (modifiers.includes('away') || modifiers.includes('outside')) {
        listenerTarget = document;

        handler = wrapHandler(handler, (next, e) => {
            if (el.contains(e.target)) return;
            if (e.target.isConnected === false) return;
            if (el.offsetWidth < 1 && el.offsetHeight < 1) return;
            // Additional check for special implementations (e.g. collapse)
            if (el._x_isShown === false || el.__ssShown === false) return;
            next(e);
        });
    }

    if (modifiers.includes('self')) {
        handler = wrapHandler(handler, (next, e) => { e.target === el && next(e); });
    }

    // Handle :keydown and :keyup listeners.
    // Handle :click and :auxclick-like listeners.
    if (isKeyEvent(event) || isClickEvent(event)) {
        handler = wrapHandler(handler, (next, e) => {
            if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) return;
            next(e);
        });
    }

    listenerTarget.addEventListener(event, handler, optionsRef);

    const removeListener = () => {
        active = false;
        listenerTarget.removeEventListener(event, handler, optionsRef);
    };

    if (el && el.nodeType === 1) {
        // Expose cleanup so the framework can release listeners later if needed
        el.__ssOnCleanup = el.__ssOnCleanup || [];
        el.__ssOnCleanup.push(removeListener);
    }

    return removeListener;

    /**
     * Runs the user expression with $event available.
     * Supports bare method references: `ss-on:click="handleClick"`
     * invokes `handleClick($event)`.
     */
    function invoke(e) {
        if (isBareMethodReference(expr)) {
            const evaluator = createEvaluator(expr, scope, el);
            const fn = evaluator({ $event: e });
            if (typeof fn === 'function') fn(e);
            return;
        }

        const executor = createExecutor(expr, scope, el);
        executor({ $event: e });
    }
}

function addDebounceOrThrottle(modifiers, handler) {
    if (modifiers.includes('debounce')) {
        let nextModifier = modifiers[modifiers.indexOf('debounce') + 1] || 'invalid-wait';
        let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;

        handler = debounce(handler, wait);
    }
    if (modifiers.includes('throttle')) {
        let nextModifier = modifiers[modifiers.indexOf('throttle') + 1] || 'invalid-wait';
        let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;

        handler = throttle(handler, wait);
    }
    return handler;
}

function debounce(func, wait) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function throttle(func, limit) {
    let inThrottle;

    return function (...args) {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

function dotSyntax(subject) {
    return subject.replace(/-/g, '.')
}

function camelCase(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase())
}

function isNumeric(subject) {
    // NaN strings should return false; short-circuit empty strings
    if (subject === '') return false;
    return !Array.isArray(subject) && !isNaN(subject);
}

function kebabCase(subject) {
    if ([' ', '_'].includes(subject)) return subject;
    return subject.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[_\s]/, '-').toLowerCase()
}

function isKeyEvent(event) {
    return ['keydown', 'keyup'].includes(event)
}

function isClickEvent(event) {
    return ['contextmenu', 'click', 'mouse'].some(i => event.includes(i))
}

// Every modifier ss-on consumes. None of them is a key name, so none of them
// may be mistaken for one. (`enter` is deliberately absent: it is a real key.)
const nonKeyModifiers = [
    // ss-on's own modifiers:
    'window', 'document', 'prevent', 'stop', 'once', 'capture', 'self',
    'away', 'outside', 'passive', 'dot', 'camel',
    // ss-model's own modifiers:
    'blur', 'change', 'lazy', 'number', 'boolean', 'trim', 'fill',
    'unintrusive', 'parent',
];

function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
    let keyModifiers = modifiers.filter((modifier, index) => {
        // `.passive.false` - the argument isn't a key name either.
        if (modifier === 'false' && modifiers[index - 1] === 'passive') return false

        return !nonKeyModifiers.includes(modifier)
    });

    if (keyModifiers.includes('debounce')) {
        let debounceIndex = keyModifiers.indexOf('debounce');
        keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
    }

    if (keyModifiers.includes('throttle')) {
        let throttleIndex = keyModifiers.indexOf('throttle');
        keyModifiers.splice(throttleIndex, isNumeric((keyModifiers[throttleIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
    }

    // If no modifier is specified, we'll call it a press.
    if (keyModifiers.length === 0) return false

    // If one is passed, AND it matches the key pressed, we'll call it a press.
    if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0])) return false

    // The user is listening for key combinations.
    const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'];
    const selectedSystemKeyModifiers = systemKeyModifiers.filter(modifier => keyModifiers.includes(modifier));

    keyModifiers = keyModifiers.filter(i => !selectedSystemKeyModifiers.includes(i));

    if (selectedSystemKeyModifiers.length > 0) {
        const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter(modifier => {
            // Alias "cmd" and "super" to "meta"
            if (modifier === 'cmd' || modifier === 'super') modifier = 'meta';

            return e[`${modifier}Key`]
        });

        // If all the modifiers selected are pressed, ...
        if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
            // AND the event is a click. It's a pass.
            if (isClickEvent(e.type)) return false

            // OR the remaining key is pressed as well. It's a press.
            if (keyToModifiers(e.key).includes(keyModifiers[0])) return false
        }
    }

    // We'll call it NOT a valid keypress.
    return true
}

function keyToModifiers(key) {
    if (!key) return []

    key = kebabCase(key);

    let modifierToKeyMap = {
        'ctrl': 'control',
        'slash': '/',
        'space': ' ',
        'spacebar': ' ',
        'cmd': 'meta',
        'esc': 'escape',
        'up': 'arrow-up',
        'down': 'arrow-down',
        'left': 'arrow-left',
        'right': 'arrow-right',
        'period': '.',
        'comma': ',',
        'equal': '=',
        'minus': '-',
        'underscore': '_',
    };

    modifierToKeyMap[key] = key;

    return Object.keys(modifierToKeyMap).map(modifier => {
        if (modifierToKeyMap[modifier] === key) return modifier
    }).filter(modifier => modifier)
}

function isBareMethodReference(expr) {
    return /^[$\w$.]+$/.test(expr) && /[A-Za-z_$]/.test(expr)
}

/**
 * SenangStart Actions - ss-on Directive
 * Delegates all event handling logic to handlers/events.js
 * 
 * @module directives/on
 */


function install$1() {
    registerAttribute('ss-on', (el, attrName, expr, scope) => {
        handleEvent(el, attrName, expr, scope);
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
 * SenangStart Actions
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

export { SenangStart as default };
