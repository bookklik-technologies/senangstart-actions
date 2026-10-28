const iterationKey = Symbol('iteration');
const proxyMetadata = new WeakMap();
const effectDependencies = new WeakMap();
const ownedEffects = new WeakMap();
const stoppedEffects = new WeakSet();
const pendingCallbacks = new Set();
let pendingUpdate = false;

export const pendingEffects = new Set();
export let currentEffect = null;

function track(subscribers, property) {
    if (!currentEffect) return;
    if (!subscribers.has(property)) subscribers.set(property, new Set());
    const dependencies = subscribers.get(property);
    dependencies.add(currentEffect);
    effectDependencies.get(currentEffect)?.add(dependencies);
}

export function createReactive(data, onUpdate) {
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

export function cleanupTree(node) {
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

export function runEffect(fn, owner) {
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

export function scheduleUpdate(callback) {
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
