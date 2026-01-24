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

This generates three bundles in `dist/`:

| File | Format | Use Case |
|------|--------|----------|
| `senangstart-actions.js` | IIFE | Browser `<script>` tag |
| `senangstart-actions.min.js` | IIFE (minified) | Production CDN (unpkg, jsDelivr) |
| `senangstart-actions.esm.js` | ES Module | Modern bundlers, `import` |

## Build Configuration

Rollup configuration in `rollup.config.js`:
- Entry: `src/index.js`
- Terser plugin for minification
- Banner with version and license info

## Pre-Release Checklist

2. Update version in `package.json`:

```json
"version": "X.Y.Z"
```

3. Update version in `src/index.js`:

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

After publishing, the library is available via:
- unpkg: `https://unpkg.com/@bookklik/senangstart-actions`
- jsDelivr: `https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions`

## What Gets Published

The `files` field in `package.json` includes only:
- `src/` - Source files
- `dist/` - Built bundles
