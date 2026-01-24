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

2. Open `examples/index.html` in browser to test directives

3. Edit source files in `src/`:
   - `index.js` - Main entry point, public API
   - `reactive.js` - Reactive proxy system
   - `evaluator.js` - Expression evaluation with magic properties
   - `walker.js` - DOM tree traversal
   - `observer.js` - MutationObserver for dynamic content
   - `handlers/` - Directive implementations

4. Refresh browser to see changes (no HMR - manual refresh required)

5. Run tests to verify changes:

```bash
npm run test
```

## File Structure

```
src/
├── index.js           # Entry point, SenangStart public API
├── reactive.js        # Proxy-based reactivity system
├── evaluator.js       # Expression evaluation ($el, $refs, $dispatch, etc.)
├── walker.js          # DOM traversal and ss-data scope handling
├── observer.js        # MutationObserver for dynamic DOM
└── handlers/
    ├── index.js       # Handler exports
    ├── attributes.js  # ss-text, ss-html, ss-show, ss-model, etc.
    ├── bind.js        # ss-bind:[attr] handler
    ├── directives.js  # ss-for, ss-if handlers
    └── events.js      # ss-on:[event] handler with modifiers
```

## Hot Tips

- Use `ss-cloak` on elements to hide them until SenangStart initializes
- Test reactive updates by modifying state in browser console: `document.querySelector('[ss-data]').__ssScope.data.variableName = newValue`
- The framework auto-starts on script load, no manual initialization needed
