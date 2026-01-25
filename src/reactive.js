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
export const pendingEffects = new Set();
export let currentEffect = null;

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
export function createReactive(data, onUpdate) {
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
export function runEffect(fn) {
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
export function scheduleUpdate(callback) {
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
