---
name: SenangStart Actions Architecture
description: Understanding the core architecture and module structure of the SenangStart Actions declarative UI framework
---

# SenangStart Actions Architecture

## Overview

SenangStart Actions is a lightweight, declarative UI framework that uses `ss-*` HTML attributes to create reactive components **without a build step**. It's designed for both humans and AI agents to easily understand and generate.

## Core Principles

1. **Declarative HTML** - State and behavior defined via HTML attributes
2. **Automatic Reactivity** - Proxy-based change detection with dependency tracking
3. **Scoped Components** - `ss-data` creates isolated reactive scopes
4. **No Build Step** - Works directly in browser via script tag
5. **AI-Friendly** - Simple, predictable patterns for LLM-generated code

## Module Architecture

```
src/
├── index.js        # Entry point, public API, auto-start
├── reactive.js     # Proxy-based reactive system
├── evaluator.js    # Expression evaluation with magic properties
├── walker.js       # DOM traversal and scope management
├── observer.js     # MutationObserver for dynamic DOM
└── handlers/
    ├── index.js       # Handler exports
    ├── attributes.js  # Basic attribute handlers
    ├── bind.js        # Dynamic attribute binding
    ├── directives.js  # Template directives (ss-for, ss-if)
    └── events.js      # Event handling with modifiers
```

## Data Flow

```
1. Page Load
   └─> SenangStart.start()
       └─> walk(document.body)
           └─> Find ss-data, create scope
               └─> Process ss-* attributes
                   └─> runEffect() for reactivity

2. User Interaction
   └─> Event handler updates scope.data
       └─> Proxy traps set()
           └─> scheduleUpdate() (batched)
               └─> Run pending effects
                   └─> Update DOM
```

## Key Concepts

### Scope

A scope is created for each `ss-data` element:

```javascript
scope = {
    data: reactiveProxy,  // Reactive data object
    $refs: {},            // Element references (ss-ref)
    $store: globalStores  // Global stores
}
```

Stored on element as `element.__ssScope`.

### Reactive Proxy

The reactive system uses JavaScript Proxy:
- **Get trap**: Tracks which properties are accessed by each effect
- **Set trap**: Triggers re-run of effects that depend on changed property
- **Batching**: Multiple changes in same tick are batched into single DOM update

### Effects

Effects are functions that:
1. Execute and track which reactive properties they access
2. Re-run automatically when those properties change

```javascript
runEffect(() => {
    // This effect re-runs when `expr` dependencies change
    const evaluator = createEvaluator(expr, scope, el);
    el.innerText = evaluator();
});
```

### Expression Evaluation

Expressions are evaluated in a sandboxed context with:
- All `scope.data` properties available directly
- Magic properties: `$el`, `$refs`, `$store`, `$dispatch`, `$watch`, `$nextTick`, `$data`

## Bundle Formats

| Format | File | Global Variable | Use |
|--------|------|-----------------|-----|
| IIFE | `senangstart-actions.js` | `window.SenangStart` | `<script>` tag |
| IIFE (min) | `senangstart-actions.min.js` | `window.SenangStart` | Production CDN |
| ESM | `senangstart-actions.esm.js` | N/A | ES imports |

## Public API

```javascript
SenangStart.data(name, factory)  // Register reusable component
SenangStart.store(name, data)    // Register global store
SenangStart.init(root)           // Manually init DOM tree
SenangStart.start()              // Start framework (auto-called)
SenangStart.version              // Current version string
```

## File Responsibilities

| File | Responsibility |
|------|----------------|
| `index.js` | Public API, auto-start, CSS injection for `ss-cloak` |
| `reactive.js` | `createReactive()`, `runEffect()`, `scheduleUpdate()`, dependency tracking |
| `evaluator.js` | `createEvaluator()`, `createExecutor()`, magic properties |
| `walker.js` | `walk()`, scope creation, attribute processing order |
| `observer.js` | `setupObserver()`, handles dynamically added elements |
| `handlers/attributes.js` | Handlers for ss-text, ss-html, ss-show, ss-model, ss-ref, ss-init, ss-effect |
| `handlers/bind.js` | Handler for ss-bind:[attr] dynamic attributes |
| `handlers/directives.js` | Handlers for ss-for, ss-if template directives |
| `handlers/events.js` | Handler for ss-on:[event] with modifiers |
