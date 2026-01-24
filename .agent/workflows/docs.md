---
description: Develop and build documentation with VitePress
---

# Documentation Workflow

// turbo-all

## Development

1. Start the documentation development server:

```bash
npm run docs:dev
```

This starts VitePress at `http://localhost:5173` with HMR.

## Documentation Structure

```
docs/
├── index.md              # Homepage
├── guide/                # Guides and tutorials
├── directives/           # Directive reference (ss-data, ss-for, etc.)
│   ├── index.md
│   ├── ss-data.md
│   ├── ss-for.md
│   ├── ss-if.md
│   ├── ss-on.md
│   ├── ss-model.md
│   ├── ss-text.md
│   ├── ss-html.md
│   ├── ss-show.md
│   ├── ss-bind.md
│   ├── ss-ref.md
│   ├── ss-effect.md
│   ├── ss-cloak.md
│   ├── ss-transition.md
│   └── magic-properties.md
├── properties/           # Magic properties reference
├── api/                  # Public API documentation
├── ms/                   # Malay translations
├── public/               # Static assets
└── .vitepress/
    ├── config.js         # VitePress configuration
    └── theme/            # Custom theme
```

## Writing Documentation

2. Create or edit markdown files in the appropriate directory

3. Use frontmatter for page metadata:

```yaml
---
title: Directive Name
description: What this directive does
---
```

4. Include live examples using HTML code blocks with inline `ss-*` attributes

5. Use consistent structure:
   - Overview/description
   - Syntax
   - Examples (basic to advanced)
   - API table (if applicable)
   - Related directives

## Building for Production

6. Build the documentation:

```bash
npm run docs:build
```

Output goes to `docs/.vitepress/dist/`.

7. Preview the production build:

```bash
npm run docs:preview
```

## Deployment

Documentation auto-deploys to GitHub Pages via `.github/workflows/deploy-docs.yml` on push to `master` branch.

## Localization

- English docs in `docs/`
- Malay translations in `docs/ms/` - keep synchronized with English
