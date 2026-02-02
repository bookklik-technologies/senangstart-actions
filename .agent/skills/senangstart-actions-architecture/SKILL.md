---
name: SenangStart Actions Architecture
description: Understanding the core architecture and module structure of the SenangStart Actions declarative UI framework
---

# SenangStart Actions Architecture

## Overview

SenangStart Actions is a lightweight, declarative UI framework that uses `ss-*` HTML attributes to create reactive components. It is designed to be modular, allowing usage of the full framework or individual directives.

## Core Principles

1.  **Declarative HTML** - State and behavior defined via HTML attributes.
2.  **Automatic Reactivity** - Proxy-based change detection with dependency tracking.
3.  **Modular Design** - Split into Core, Directives, and Bundles.
4.  **No Build Step Required** - Can be used directly in browser.
5.  **AI-Friendly** - Simple patterns for LLM generation.

## Module Architecture

The codebase handles the split between the core runtime and individual directives.

```
src/
├── core/              # Core framework logic
│   ├── senangstart.js # Main instance & public API
│   └── registry.js    # Directive registry
├── directives/        # Individual directive implementations
│   ├── text.js
│   ├── if.js
│   ├── ...
├── entries/           # Entry points for directive bundles
│   ├── text.js
│   ├── ...
├── evaluator.js       # Expression evaluation
├── observer.js        # DOM MutationObserver
├── reactive.js        # Reactivity engine
├── walker.js          # DOM walker & scope management
└── index.js           # Main package entry point (Full Bundle)
```

## Data Flow

```
1. Initialization
   └─> SenangStart.start()
       └─> walk(document.body)

2. Component Creation
   └─> Found `ss-data`
       └─> Create Scope (Proxy)
       └─> Process Children

3. Directive Execution
   └─> `ss-text="msg"` found
       └─> Look up handler in Registry
       └─> Run Handler
           └─> runEffect() -> Track Dependencies
```

## Key Concepts

### Registry (`src/core/registry.js`)
Central place where all directives are registered. Replaces the old hardcoded `handlers/` mapping.
`registerAttribute('ss-name', handler)`

### Scope
Created for each `ss-data`. Contains:
- `data`: The reactive state.
- `$refs`: Element references.
- `$store`: Global state.

### Reactivity
Uses `src/reactive.js`.
- **Proxy**: Intercepts get/set.
- **Effects**: Functions that re-run when dependencies change.

## Bundle Formats

| Format | File Pattern | Description |
|--------|--------------|-------------|
| **Full** | `senangstart-actions.{js,min.js}` | Everything included. |
| **Core** | `senangstart-actions-core.{js,min.js}` | Runtime only (no directives). |
| **Directive** | `senangstart-actions-[name].{js,min.js}` | Standalone directive (includes core if needed, or reuses global). |

## File Responsibilities

| File | Structure | Responsibility |
|------|-----------|----------------|
| `src/core/senangstart.js` | Core | `SenangStart` global, `start()`, `init()`. |
| `src/core/registry.js` | Core | Maps attribute names to handler functions. |
| `src/directives/*.js` | Directive | Implementation of specific behavior (install export). |
| `src/entries/*.js` | Entry | Configures standalone bundle for a directive. |
| `src/index.js` | Entry | Imports all directives and exports full bundle. |
| `src/reactive.js` | Core | Reactivity system (Proxy, Effects). |
| `src/walker.js` | Core | DOM traversal. |
