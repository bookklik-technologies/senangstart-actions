---
name: Directive Development
description: Guide for implementing new ss-* directives in SenangStart Actions
---

# Directive Development Skill

## Overview

Directives are the core building blocks of SenangStart Actions. They transform HTML attributes into reactive behaviors. In the new modular architecture, each directive is a self-contained module.

## Directive Location

All directives are located in `src/directives/`. Each directive has its own file (e.g., `src/directives/text.js`).

## File Structure

### 1. Directive Implementation (`src/directives/[name].js`)

This is where the logic resides. It exports an `install` function that registers the directive.

```javascript
import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerAttribute('ss-example', (el, expr, scope) => {
        // Setup logic (runs once)
        
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            const value = evaluator();
            // Update logic (runs reactively)
            el.textContent = value;
        };
        
        // Make it reactive
        runEffect(update);
    });
}
```

### 2. Bundle Entry Point (`src/entries/[name].js`)

This is the entry point for the standalone directive bundle.

```javascript
import SenangStart from '../core/senangstart.js';
import { install } from '../directives/example.js';

install();

if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}
SenangStart.start();

export default SenangStart;
```

## Handler Signature

The handler function passed to `registerAttribute` receives:

```javascript
(el, expr, scope) => {
    // el: The DOM element
    // expr: The attribute value (string)
    // scope: The reactive scope { data, $refs, ... }
}
```

## Creating different types of Directives

### Attribute Directive (e.g. `ss-text`)

Used for updating properties or attributes of an element.

```javascript
registerAttribute('ss-text', (el, expr, scope) => {
    runEffect(() => {
        const value = createEvaluator(expr, scope, el)();
        el.textContent = value;
    });
});
```

### Structural Directive (e.g. `ss-if`)

Used for manipulating the DOM structure (templates).

**Note:** Structural directives usually need to be handled carefully in the walker, but the basic pattern for simple cases involves `createEvaluator` and DOM manipulation. Use the existing `src/directives/if.js` or `for.js` as reference for complex structural logic.

### Event Directive (e.g. `ss-on`)

Used for handling events.

```javascript
registerAttribute('ss-on', (el, expr, scope) => {
    // Parsing logic for modifiers...
    el.addEventListener('click', (e) => {
        // ...
    });
});
```

## Key Components

1. **`registerAttribute(name, handler)`** - Registers the directive globally.
2. **`createEvaluator(expr, scope, el)`** - Returns a function that evaluates the expression.
3. **`runEffect(fn)`** - Runs the function and tracks dependencies.
4. **`scope`** - Parameter containing access to `data`, `$refs`, etc.

## Magic Properties

Available in all expressions via `evaluator.js`:

| Property | Description |
|----------|-------------|
| `$el` / `$my` | Current element |
| `$refs` | Object of `ss-ref` elements |
| `$store` | Global stores |
| `$data` | The reactive data object |
| `$dispatch` | Dispatch custom event |
| `$watch` | Watch property changes |
| `$nextTick` | Run after DOM updates |

## Testing

Create a test file in `tests/unit/[name].test.js`.

```javascript
import { describe, it, expect } from 'vitest';
import { install } from '../../src/directives/example.js';

describe('ss-example', () => {
    it('updates content', async () => {
        install(); // Register the directive
        
        document.body.innerHTML = `
            <div ss-data="{ val: 'hello' }">
                <span ss-example="val"></span>
            </div>
        `;
        
        const { walk } = await import('../../src/walker.js');
        walk(document.body);
        
        await new Promise(r => queueMicrotask(r));
        
        expect(document.querySelector('span').textContent).toBe('hello');
    });
});
```
