---
name: Reactive System
description: Deep dive into the proxy-based reactive system powering SenangStart Actions
---

# Reactive System Skill

## Overview

The reactive system in SenangStart Actions is built on JavaScript Proxies, providing automatic dependency tracking and batched DOM updates.

## Core File: `src/reactive.js`

### Key Exports

```javascript
export function createReactive(data, onUpdate)  // Create reactive proxy
export function runEffect(fn)                    // Run and track effect
export function scheduleUpdate(callback)         // Batch updates
export const pendingEffects                      // Set of pending effects
export let currentEffect                         // Currently running effect
```

## How Reactivity Works

### 1. Creating a Reactive Object

```javascript
const reactive = createReactive({ count: 0 }, () => {
    console.log('Data changed!');
});
```

This wraps the object in a Proxy with:
- **subscribers**: `Map<property, Set<effect>>` - tracks which effects depend on which properties
- **__isReactive**: marker to prevent double-wrapping

### 2. Dependency Tracking (Get Trap)

When an effect runs:

```javascript
runEffect(() => {
    // Reading reactive.count here
    element.textContent = reactive.count;
});
```

Inside `runEffect`:
1. `currentEffect` is set to the effect function
2. Effect function executes
3. When `reactive.count` is accessed, the get trap fires
4. Get trap adds `currentEffect` to `subscribers.get('count')`
5. `currentEffect` is reset to null

### 3. Triggering Updates (Set Trap)

```javascript
reactive.count = 5; // Triggers update
```

When a property is set:
1. If new value equals old value, return early
2. Update the property
3. Get all effects subscribed to that property
4. Add them to `pendingEffects` Set
5. Call `scheduleUpdate()`

### 4. Batched Updates

`scheduleUpdate()` uses `queueMicrotask()`:

```javascript
export function scheduleUpdate(callback) {
    if (pendingUpdate) return;  // Already scheduled
    
    pendingUpdate = true;
    queueMicrotask(() => {
        pendingUpdate = false;
        
        // Run all pending effects
        const effects = [...pendingEffects];
        pendingEffects.clear();
        effects.forEach(effect => runEffect(effect));
        
        if (callback) callback();
    });
}
```

This means:
- Multiple synchronous changes trigger only ONE DOM update
- All effects run after current JS execution completes

## Array Reactivity

Arrays are specially handled in `createReactiveArray()`:

### Tracked Methods

```javascript
const ARRAY_MUTATING_METHODS = [
    'push', 'pop', 'shift', 'unshift',
    'splice', 'sort', 'reverse', 'fill', 'copyWithin'
];
```

These methods are intercepted to trigger updates:

```javascript
if (ARRAY_MUTATING_METHODS.includes(prop)) {
    return function(...args) {
        const result = Array.prototype[prop].apply(target, args);
        // Notify subscribers
        scheduleUpdate(onMutate);
        return result;
    };
}
```

### Array Subscriber Key

All array operations subscribe to special key `'__array__'`:

```javascript
if (!subscribers.has('__array__')) {
    subscribers.set('__array__', new Set());
}
subscribers.get('__array__').add(currentEffect);
```

## Nested Reactivity

Objects and arrays are recursively wrapped:

```javascript
// In get trap
if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
        return createReactiveArray(value, onMutate, subscribers);
    } else {
        return createReactiveObject(value, onMutate, subscribers);
    }
}
```

This provides deep reactivity automatically.

## Property Deletion

Delete operations are tracked:

```javascript
deleteProperty(target, prop) {
    delete target[prop];
    // Notify subscribers for this property
    scheduleUpdate(onMutate);
    return true;
}
```

## Best Practices

### Do
- Access reactive properties inside `runEffect()` to track them
- Use array mutating methods for array changes
- Trust batching - multiple changes in one tick = one update

### Don't
- Reassign the entire reactive object (wrap in another object)
- Use `Object.defineProperty` on reactive objects
- Mutate arrays with index assignment outside effects (use push/splice)

## Debugging Reactivity

```javascript
// Check if object is reactive
console.log(reactive.__isReactive); // true

// View subscribers
console.log(reactive.__subscribers);

// View pending effects
import { pendingEffects } from './reactive.js';
console.log(pendingEffects);
```

## Integration Points

The reactive system is used by:
- `walker.js`: Creates reactive scope for `ss-data`
- `src/directives/*.js`: All directive handlers use `runEffect()` for reactive DOM updates
- `evaluator.js`: `$watch` adds to subscribers directly
