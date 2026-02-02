---
description: Add a new ss-* directive to the framework
---

# Adding a New Directive Workflow

## Overview

This workflow guides you through adding a new `ss-*` directive to SenangStart Actions using the modular architecture.

## Steps

### 1. Implement the Directive

Create a new file in `src/directives/[name].js`. 

**Template:**
```javascript
import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerAttribute('ss-yourdirective', (el, expr, scope) => {
        // Setup logic
        
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            const value = evaluator();
            // Update logic
        };
        
        runEffect(update); // Make it reactive
    });
}
```

### 2. Create the Bundle Entry Point

Create a new file in `src/entries/[name].js`.

**Template:**
```javascript
import SenangStart from '../core/senangstart.js';
import { install } from '../directives/yourdirective.js';

install();

if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}
SenangStart.start();

export default SenangStart;
```

### 3. Update Build Configuration

Open `rollup.config.js` and add your directive name to the `directives` array:

```javascript
const directives = [
    'data', 'text', ..., 'yourdirective'
];
```

### 4. Register in Main Entry (Optional)

If this directive should be part of the main default bundle, import and install it in `src/index.js`.

```javascript
import { install as installYourDirective } from './directives/yourdirective.js';

// ... inside the main installation function
installYourDirective();
```

### 5. Write Tests

Create `tests/[name].test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { install } from '../src/directives/yourdirective.js';

describe('ss-yourdirective', () => {
    it('works', async () => {
        install(); // Register the directive
        document.body.innerHTML = `<div ss-yourdirective="..."></div>`;
        
        // ... trigger walk/updates
        const { walk } = await import('../src/walker.js');
        walk(document.body);
        
        await new Promise(r => queueMicrotask(r));
        // assertions
    });
});
```

### 6. Document the Directive

Create `docs/directives/ss-yourdirective.md` and add it to `docs/.vitepress/config.js` sidebar.

### 7. Build and Verification

// turbo
```bash
npm run test
npm run build
```
