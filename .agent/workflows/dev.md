---
description: Start the development server and watch for changes
---

# Development Workflow

// turbo-all

## Prerequisites

Ensure dependencies are installed:

```bash
npm install
```

## Starting Development Server

1. Start the local development server:

```bash
npm run dev
```

This runs `npx -y serve .` which serves the project at `http://localhost:3000`.

## Development Cycle

2. Open `examples/index.html` in browser to test directives.

3. Edit source files in `src/`. The project is structured as follows:

```
src/
├── core/              # Core framework logic (registry, runtime)
│   ├── senangstart.js # Core entry point
│   └── registry.js    # Directive/Attribute registry
├── directives/        # Individual directive implementations
│   ├── text.js
│   ├── if.js
│   └── ...
├── entries/           # Entry points for directive bundles
├── handlers/          # Shared handler utilities
├── evaluator.js       # Expression evaluation
├── observer.js        # DOM MutationObserver
├── reactive.js        # Reactivity engine
├── walker.js          # DOM walker
└── index.js           # Main package entry point
```

4. Refresh browser to see changes (manual refresh required).

5. Run tests to verify changes:

```bash
npm run test
```

## Hot Tips

- **Modular Testing**: To test specific directives, use the example files in `examples/` which often load the full build, but you can create custom test files.
- **Console Debugging**: Access internal state via `document.querySelector('[ss-*]').__ssScope`.
- **New Directives**: If creating a new directive, follow the [add-directive](./add-directive.md) workflow.
