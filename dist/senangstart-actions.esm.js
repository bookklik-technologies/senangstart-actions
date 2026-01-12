/**
 * SenangStart Actions v0.1.0
 * Declarative UI framework for humans and AI agents
 * @license MIT
 */
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

/**
 * SenangStart Actions - Attribute Handlers
 * Handlers for basic ss-* attributes
 * 
 * @module handlers/attributes
 */


/**
 * Handle ss-transition animations
 */
function handleTransition(el, show, originalDisplay) {
    if (show) {
        // Enter transition
        el.classList.add('ss-enter-from');
        el.classList.add('ss-enter-active');
        el.style.display = originalDisplay;
        
        requestAnimationFrame(() => {
            el.classList.remove('ss-enter-from');
            el.classList.add('ss-enter-to');
        });
        
        const onEnd = () => {
            el.classList.remove('ss-enter-active', 'ss-enter-to');
            el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
    } else {
        // Leave transition
        el.classList.add('ss-leave-from');
        el.classList.add('ss-leave-active');
        
        requestAnimationFrame(() => {
            el.classList.remove('ss-leave-from');
            el.classList.add('ss-leave-to');
        });
        
        const onEnd = () => {
            el.style.display = 'none';
            el.classList.remove('ss-leave-active', 'ss-leave-to');
            el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
    }
}

/**
 * Attribute handlers map
 */
const attributeHandlers = {
    /**
     * ss-text: Set element's innerText
     */
    'ss-text': (el, expr, scope) => {
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            el.innerText = evaluator() ?? '';
        };
        runEffect(update);
    },
    
    /**
     * ss-html: Set element's innerHTML
     */
    'ss-html': (el, expr, scope) => {
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            el.innerHTML = evaluator() ?? '';
        };
        runEffect(update);
    },
    
    /**
     * ss-show: Toggle visibility
     */
    'ss-show': (el, expr, scope) => {
        const originalDisplay = el.style.display || '';
        
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            const show = !!evaluator();
            
            if (el.hasAttribute('ss-transition')) {
                handleTransition(el, show, originalDisplay);
            } else {
                el.style.display = show ? originalDisplay : 'none';
            }
        };
        runEffect(update);
    },
    
    /**
     * ss-model: Two-way binding for inputs
     */
    'ss-model': (el, expr, scope) => {
        const { data } = scope;
        
        // Determine input type
        const isCheckbox = el.type === 'checkbox';
        const isRadio = el.type === 'radio';
        const isSelect = el.tagName === 'SELECT';
        
        // Set initial value
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
        
        // Listen for changes
        const eventType = isCheckbox || isRadio ? 'change' : 'input';
        el.addEventListener(eventType, () => {
            let newValue;
            
            if (isCheckbox) {
                newValue = el.checked;
            } else if (isRadio) {
                if (el.checked) newValue = el.value;
                else return; // Don't update if not checked
            } else {
                newValue = el.value;
            }
            
            // Set the value on the data object
            data[expr] = newValue;
        });
    },
    
    /**
     * ss-ref: Register element reference
     */
    'ss-ref': (el, name, scope) => {
        scope.$refs[name] = el;
    },
    
    /**
     * ss-init: Run initialization code
     */
    'ss-init': (el, expr, scope) => {
        const executor = createExecutor(expr, scope, el);
        executor();
    },
    
    /**
     * ss-effect: Run reactive effect
     */
    'ss-effect': (el, expr, scope) => {
        const update = () => {
            const executor = createExecutor(expr, scope, el);
            executor();
        };
        runEffect(update);
    }
};

/**
 * SenangStart Actions - Bind Handler
 * Handler for ss-bind:[attr] dynamic attribute binding
 * 
 * @module handlers/bind
 */


/**
 * Handle ss-bind:[attr] dynamically
 */
function handleBind(el, attrName, expr, scope) {
    const attr = attrName.replace('ss-bind:', '');
    
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        const value = evaluator();
        
        if (attr === 'class') {
            if (typeof value === 'string') {
                el.className = value;
            } else if (typeof value === 'object') {
                // Object syntax: { 'class-name': condition }
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
}

/**
 * SenangStart Actions - Event Handler
 * Handler for ss-on:[event] with modifiers
 * 
 * @module handlers/events
 */


/**
 * Handle ss-on:[event] dynamically
 */
function handleEvent(el, attrName, expr, scope) {
    const parts = attrName.replace('ss-on:', '').split('.');
    const eventName = parts[0];
    const modifiers = parts.slice(1);
    
    const executor = createExecutor(expr, scope, el);
    
    const handler = (event) => {
        // Handle modifiers
        if (modifiers.includes('prevent')) event.preventDefault();
        if (modifiers.includes('stop')) event.stopPropagation();
        if (modifiers.includes('self') && event.target !== el) return;
        if (modifiers.includes('once')) {
            el.removeEventListener(eventName, handler);
        }
        
        // For keyboard events, check key modifiers
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
        
        // Execute the expression with $event available
        scope.data.$event = event;
        executor();
        delete scope.data.$event;
    };
    
    // Special window/document events
    if (modifiers.includes('window')) {
        window.addEventListener(eventName, handler);
    } else if (modifiers.includes('document')) {
        document.addEventListener(eventName, handler);
    } else {
        el.addEventListener(eventName, handler);
    }
}

/**
 * SenangStart Actions - Directive Handlers
 * Handlers for ss-for and ss-if template directives
 * 
 * @module handlers/directives
 */


// Forward declaration - will be set by walker.js
let walkFn = null;

/**
 * Set the walk function reference (to avoid circular imports)
 */
function setWalkFunction(fn) {
    walkFn = fn;
}

/**
 * Handle ss-for directive
 */
function handleFor(templateEl, expr, scope) {
    // Parse expression: "item in items" or "(item, index) in items"
    const match = expr.match(/^\s*(?:\(([^,]+),\s*([^)]+)\)|([^\s]+))\s+in\s+(.+)$/);
    if (!match) {
        console.error('[SenangStart] Invalid ss-for expression:', expr);
        return;
    }
    
    const itemName = match[1] || match[3];
    const indexName = match[2] || 'index';
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
        
        // Check if items actually changed (shallow comparison)
        const itemsJSON = JSON.stringify(items);
        if (itemsJSON === lastItemsJSON) {
            return; // No change, skip re-render
        }
        lastItemsJSON = itemsJSON;
        
        // Remove old nodes
        currentNodes.forEach(node => node.remove());
        currentNodes = [];
        
        // Create new nodes
        items.forEach((item, index) => {
            const clone = templateEl.content.cloneNode(true);
            const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
            
            // Create child scope with item and index - use parent scope's data for non-item properties
            const itemScope = {
                data: createReactive({ 
                    ...scope.data, 
                    [itemName]: item, 
                    [indexName]: index 
                }, () => {}),
                $refs: scope.$refs,
                $store: scope.$store,
                parentData: scope.data // Keep reference to parent data
            };
            
            nodes.forEach(node => {
                parent.insertBefore(node, anchor);
                currentNodes.push(node);
                if (walkFn) walkFn(node, itemScope);
            });
        });
    };
    
    runEffect(update);
}

/**
 * Handle ss-if directive
 */
function handleIf(templateEl, expr, scope) {
    const parent = templateEl.parentNode;
    const anchor = document.createComment(`ss-if: ${expr}`);
    parent.insertBefore(anchor, templateEl);
    templateEl.remove();
    
    let currentNodes = [];
    
    const update = () => {
        const evaluator = createEvaluator(expr, scope, templateEl);
        const condition = !!evaluator();
        
        // Remove old nodes
        currentNodes.forEach(node => node.remove());
        currentNodes = [];
        
        if (condition) {
            const clone = templateEl.content.cloneNode(true);
            const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
            
            nodes.forEach(node => {
                parent.insertBefore(node, anchor);
                currentNodes.push(node);
                if (walkFn) walkFn(node, scope);
            });
        }
    };
    
    runEffect(update);
}

/**
 * SenangStart Actions - DOM Walker
 * Recursive DOM traversal and initialization
 * 
 * @module walker
 */


// Store references
let registeredDataFactories$1 = {};
let stores$1 = {};

/**
 * Set external references (called from index.js)
 */
function setReferences(dataFactories, storeRef) {
    registeredDataFactories$1 = dataFactories;
    stores$1 = storeRef;
}

/**
 * Walk the DOM tree and initialize SenangStart attributes
 */
function walk(el, parentScope = null) {
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
            if (registeredDataFactories$1[dataExpr]) {
                initialData = registeredDataFactories$1[dataExpr]();
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
            $store: stores$1
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
 * SenangStart Actions v0.1.0
 * Declarative UI framework for humans and AI agents
 * 
 * @license MIT
 * @author Bookklik
 * @module senangstart-actions
 */


// =========================================================================
// CSS Injection for ss-cloak
// =========================================================================
const style = document.createElement('style');
style.textContent = '[ss-cloak] { display: none !important; }';
document.head.appendChild(style);

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

// =========================================================================
// Auto-start
// =========================================================================

// Expose globally
if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}

// Auto-start when script loads
SenangStart.start();

export { SenangStart as default };
