---
name: Directive Development
description: Guide for implementing new ss-* directives in SenangStart Actions
---

# Directive Development Skill

## Overview

Directives are the core building blocks of SenangStart Actions. They transform HTML attributes into reactive behaviors.

## Directive Categories

| Category | Location | Pattern | Examples |
|----------|----------|---------|----------|
| Attribute | `handlers/attributes.js` | `ss-name` | ss-text, ss-html, ss-show |
| Dynamic Attr | `handlers/bind.js` | `ss-bind:attr` | ss-bind:class, ss-bind:disabled |
| Event | `handlers/events.js` | `ss-on:event` | ss-on:click, ss-on:keydown.enter |
| Structural | `handlers/directives.js` | `ss-name` on `<template>` | ss-for, ss-if |

## Handler Signature

All handlers receive the same parameters:

```javascript
function handler(el, value, scope) {
    // el: The DOM element with the directive
    // value: The attribute value (expression string)
    // scope: { data, $refs, $store }
}
```

## Creating an Attribute Directive

### Basic Pattern

```javascript
// In handlers/attributes.js
'ss-example': (el, expr, scope) => {
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        const result = evaluator();
        // Apply result to element
    };
    runEffect(update);
},
```

### Key Components

1. **`createEvaluator()`** - Evaluates expression and returns value
2. **`runEffect()`** - Makes the handler reactive to data changes
3. **`scope.data`** - Access the reactive data object

### Example: ss-uppercase

```javascript
'ss-uppercase': (el, expr, scope) => {
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        el.textContent = String(evaluator() ?? '').toUpperCase();
    };
    runEffect(update);
},
```

## Creating a Dynamic Attribute Directive

### Pattern for ss-bind:*

```javascript
// In handlers/bind.js
export function handleBind(el, attrName, expr, scope) {
    const attr = attrName.replace('ss-bind:', '');
    
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        const value = evaluator();
        
        // Special cases
        if (attr === 'class') {
            // Handle object or string
        } else if (attr === 'style') {
            // Handle object or string
        } else if (value === null || value === false) {
            el.removeAttribute(attr);
        } else {
            el.setAttribute(attr, value);
        }
    };
    
    runEffect(update);
}
```

## Creating an Event Directive

### Pattern for ss-on:*

```javascript
// In handlers/events.js
export function handleEvent(el, attrName, expr, scope) {
    const parts = attrName.replace('ss-on:', '').split('.');
    const eventName = parts[0];
    const modifiers = parts.slice(1);
    
    const executor = createExecutor(expr, scope, el);  // Note: executor not evaluator
    
    const handler = (event) => {
        // Apply modifiers
        if (modifiers.includes('prevent')) event.preventDefault();
        if (modifiers.includes('stop')) event.stopPropagation();
        
        // Make $event available
        scope.data.$event = event;
        executor();
        delete scope.data.$event;
    };
    
    el.addEventListener(eventName, handler);
}
```

### Differences: Evaluator vs Executor

| | `createEvaluator()` | `createExecutor()` |
|---|---|---|
| Returns | Value of expression | undefined |
| Expression | `return (${expr})` | `${expr}` |
| Use for | Reading values | Side effects |
| Example | `count + 1` | `count++` |

## Creating a Structural Directive

Structural directives (like `ss-for`, `ss-if`) work with `<template>` elements.

### Pattern

```javascript
export function handleStructural(templateEl, expr, scope) {
    // 1. Create anchor comment
    const parent = templateEl.parentNode;
    const anchor = document.createComment(`ss-directive: ${expr}`);
    parent.insertBefore(anchor, templateEl);
    templateEl.remove();
    
    let currentNodes = [];  // Track rendered nodes
    
    const update = () => {
        // 2. Evaluate condition/expression
        const evaluator = createEvaluator(expr, scope, templateEl);
        const result = evaluator();
        
        // 3. Remove old nodes
        currentNodes.forEach(node => node.remove());
        currentNodes = [];
        
        // 4. Clone and insert template content
        if (shouldRender) {
            const clone = templateEl.content.cloneNode(true);
            const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
            
            nodes.forEach(node => {
                parent.insertBefore(node, anchor);
                currentNodes.push(node);
                walkFn(node, scope);  // Process child directives
            });
        }
    };
    
    runEffect(update);
}
```

### Registering Structural Directives

In `handlers/directives.js`, export the function.

In `walker.js`, add handling before regular attribute processing:

```javascript
if (el.tagName === 'TEMPLATE' && el.hasAttribute('ss-newdirective')) {
    handleNewDirective(el, el.getAttribute('ss-newdirective'), scope);
    return;  // Important: don't process children normally
}
```

## Magic Properties

Available in all expressions via `evaluator.js`:

| Property | Description |
|----------|-------------|
| `$el` / `$my` | Current element |
| `$refs` | Object of `ss-ref` elements |
| `$store` | Global stores |
| `$data` | The reactive data object |
| `$dispatch(name, detail)` | Dispatch custom event |
| `$watch(prop, callback)` | Watch property changes |
| `$nextTick(fn)` | Run after DOM updates |

## Testing Directives

```javascript
import { describe, it, expect } from 'vitest';

describe('ss-example', () => {
    it('should work', async () => {
        document.body.innerHTML = `
            <div ss-data="{ value: 'test' }">
                <span ss-example="value"></span>
            </div>
        `;
        
        const { walk } = await import('../src/walker.js');
        walk(document.body, null);
        
        await new Promise(r => queueMicrotask(r));
        
        expect(document.querySelector('span').textContent).toBe('TEST');
    });
});
```

## Documentation Template

```markdown
---
title: ss-newdirective
---

# ss-newdirective

## Overview
One sentence description.

## Syntax
\`\`\`html
<element ss-newdirective="expression"></element>
\`\`\`

## Parameters
| Name | Type | Description |
|------|------|-------------|
| expression | String | What the expression does |

## Examples

### Basic Usage
\`\`\`html
<div ss-data="{ value: 'Hello' }">
    <span ss-newdirective="value">Placeholder</span>
</div>
\`\`\`

### Advanced Usage
...

## Related
- [ss-related](./ss-related.md)
```
