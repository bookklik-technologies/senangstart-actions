---
description: Add a new ss-* directive to the framework
---

# Adding a New Directive Workflow

## Overview

This workflow guides you through adding a new `ss-*` directive to SenangStart Actions.

## Steps

### 1. Determine Directive Type

Decide which handler file the directive belongs in:

| Type | File | Examples |
|------|------|----------|
| Simple attribute | `src/handlers/attributes.js` | ss-text, ss-html, ss-show, ss-model |
| Dynamic attribute | `src/handlers/bind.js` | ss-bind:[attr] |
| Event handling | `src/handlers/events.js` | ss-on:[event] |
| Template/structural | `src/handlers/directives.js` | ss-for, ss-if |

### 2. Implement the Handler

For **attribute handlers** (`attributes.js`), add to the `attributeHandlers` object:

```javascript
'ss-newdirective': (el, expr, scope) => {
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        const value = evaluator();
        // Apply logic to element
    };
    runEffect(update);  // Makes it reactive
},
```

For **structural directives** (`directives.js`):

```javascript
export function handleNewDirective(templateEl, expr, scope) {
    const anchor = document.createComment(`ss-newdirective: ${expr}`);
    // Handle template cloning and DOM manipulation
    
    const update = () => {
        // React to data changes
    };
    
    runEffect(update);
}
```

### 3. Register in Walker (if needed)

For new structural directives, update `src/walker.js`:

```javascript
// Add import
import { handleNewDirective } from './handlers/directives.js';

// Add handling logic in walk() function
if (el.tagName === 'TEMPLATE' && el.hasAttribute('ss-newdirective')) {
    handleNewDirective(el, el.getAttribute('ss-newdirective'), scope);
    return;
}
```

### 4. Export Handler (if new file or new export)

Update `src/handlers/index.js` if adding new exports:

```javascript
export { handleNewDirective } from './directives.js';
```

### 5. Write Tests

Create tests in `tests/`:

```javascript
// tests/newdirective.test.js or add to existing test file
describe('ss-newdirective', () => {
    it('should handle basic case', async () => {
        document.body.innerHTML = `
            <div ss-data="{ value: 'test' }">
                <span ss-newdirective="value"></span>
            </div>
        `;
        
        // Trigger walk
        const { walk } = await import('../src/walker.js');
        walk(document.body, null);
        
        await new Promise(r => queueMicrotask(r));
        
        expect(/* assertion */).toBe(/* expected */);
    });
});
```

// turbo
6. Run tests:

```bash
npm run test
```

### 7. Document the Directive

Create `docs/directives/ss-newdirective.md`:

```markdown
---
title: ss-newdirective
description: Description of what the directive does
---

# ss-newdirective

## Overview
Brief description...

## Syntax
\`\`\`html
<element ss-newdirective="expression"></element>
\`\`\`

## Examples
### Basic Usage
...

## Related
- [ss-related](./ss-related.md)
```

### 8. Update Documentation Config

Add to sidebar in `docs/.vitepress/config.js` under directives section.

### 9. Build and Verify

// turbo
```bash
npm run build
npm run docs:dev
```

## Best Practices

- Use `createEvaluator()` for expressions returning values
- Use `createExecutor()` for expressions with side effects
- Wrap updates in `runEffect()` for reactivity
- Access magic properties via scope: `$el`, `$refs`, `$store`, `$dispatch`
- Handle cleanup for removed elements (event listeners, observers)
