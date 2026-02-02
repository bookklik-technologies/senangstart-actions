---
description: Build production bundles and prepare for release
---

# Build & Release Workflow

// turbo-all

## Building Production Bundles

1. Run the build command:

```bash
npm run build
```

This generates a comprehensive set of bundles in `dist/`, supporting both a monolithic approach and a modular architecture.

### Build Artifacts

| Bundle Type | File Pattern | Description |
|-------------|--------------|-------------|
| **Main Bundle** | `senangstart-actions.{js, min.js, esm.js}` | Complete framework with all standard directives. Use this for quick start. |
| **Core Bundle** | `senangstart-actions-core.{js, min.js}` | The core runtime (reactivity, observer, walker) without any directives. |
| **Directive Bundles** | `senangstart-actions-[name].{js, min.js}` | Standalone bundles for individual directives (e.g., `ss-text`, `ss-for`). |

### Build Configuration

Rollup configuration in `rollup.config.js`:
- **Main Entry**: `src/index.js`
- **Core Entry**: `src/core/senangstart.js`
- **Directive Entries**: `src/entries/[name].js`
- **Format**: IIFE (for browser) and ESM (for bundlers).
- **Minification**: Uses `@rollup/plugin-terser`.

## Pre-Release Checklist

2. Update version in `package.json`:

```json
"version": "X.Y.Z"
```

3. Update version in `src/index.js` (if exposed):

```javascript
version: 'X.Y.Z'
```

4. Update banner version in `rollup.config.js`:

```javascript
banner: '/**\n * SenangStart Actions vX.Y.Z\n...'
```

5. Run tests to ensure everything passes:

```bash
npm run test
```

6. Build production bundles:

```bash
npm run build
```

7. Build documentation:

```bash
npm run docs:build
```

## Publishing to npm

8. Ensure you're logged in to npm:

```bash
npm login
```

9. Publish the package:

```bash
npm publish --access public
```

## CDN Distribution

After publishing, the library is available via unpkg or jsDelivr.
Example for modular loading:
```html
<script src="https://unpkg.com/@bookklik/senangstart-actions/dist/senangstart-actions-core.min.js"></script>
<script src="https://unpkg.com/@bookklik/senangstart-actions/dist/senangstart-actions-text.min.js"></script>
```

## What Gets Published

The `files` field in `package.json` includes:
- `src/` - Source files
- `dist/` - Built bundles
