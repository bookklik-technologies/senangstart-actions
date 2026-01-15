# SenangStart Actions

Declarative UI framework for humans and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

## Installation

```bash
npm install @bookklik/senangstart-actions
```

## Basic Usage

Include the script and use `ss-*` directives in your HTML:

```html
<script src="dist/senangstart-actions.js"></script>

<div ss-data="{ count: 0 }">
    <button ss-on:click="count--">-</button>
    <span ss-text="count"></span>
    <button ss-on:click="count++">+</button>
</div>
```

## Key Directives

- `ss-data`: Define component state within a scope
- `ss-text`: Update text content reactively
- `ss-html`: Update inner HTML reactively
- `ss-on:[event]`: Listen for events (e.g., `ss-on:click`)
- `ss-model`: Two-way data binding for inputs
- `ss-if`: Conditionally render elements
- `ss-show`: Toggle visibility (display: none)
- `ss-for`: Loop over arrays/objects
- `ss-bind:[attr]`: Bind attributes dynamically

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Start documentation server
npm run docs:dev
```

## Documentation

Full docs at [bookklik-technologies.github.io/senangstart-actions](https://bookklik-technologies.github.io/senangstart-actions/)

## License

Read [MIT License](LICENSE.md)
