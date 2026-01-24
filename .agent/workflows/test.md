---
description: Run tests and generate coverage reports
---

# Testing Workflow

// turbo-all

## Running Tests

1. Run all tests once:

```bash
npm run test
```

2. Run tests in watch mode during development:

```bash
npm run test:watch
```

3. Generate coverage report:

```bash
npm run test:coverage
```

Coverage report is generated in `coverage/` directory with HTML output.

## Test Structure

Tests are located in `tests/` directory:

| File | Purpose |
|------|---------|
| `reactive.test.js` | Reactive proxy system tests |
| `evaluator.test.js` | Expression evaluation tests |
| `walker.test.js` | DOM traversal tests |
| `handlers.test.js` | Attribute handler tests |
| `directives.test.js` | ss-for, ss-if template tests |
| `integration.test.js` | Full component integration tests |

## Testing Configuration

- **Environment**: jsdom (browser-like DOM in Node.js)
- **Framework**: Vitest
- **Globals**: `describe`, `it`, `expect`, `vi` available globally
- **Coverage**: v8 provider, excludes `src/index.js` (auto-start logic)

## Writing Tests

4. Create test file in `tests/` following naming convention `*.test.js`

5. Import from source using relative paths:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { createReactive, runEffect } from '../src/reactive.js';

describe('featureName', () => {
    it('should do something', async () => {
        // Test reactive updates by awaiting microtask queue
        await new Promise(resolve => queueMicrotask(resolve));
        expect(result).toBe(expected);
    });
});
```

## Tips

- Use `vi.fn()` for mock functions
- Await `queueMicrotask` to wait for reactive batched updates
- For DOM tests, create elements with `document.createElement()`
- Check `__ssScope` on elements for scope inspection
