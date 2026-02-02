# Directives Reference

SenangStart Actions uses HTML attributes prefixed with `ss-` to add reactive behavior to elements.

## Core Directives

| Directive | Description |
|-----------|-------------|
| [ss-data](/directives/ss-data) | Define reactive data scope |
| [ss-text](/directives/ss-text) | Bind text content |
| [ss-id](/directives/ss-id) | Declare scoped IDs |
| [ss-show](/directives/ss-show) | Toggle visibility |
| [ss-if](/directives/ss-if) | Conditional rendering |
| [ss-for](/directives/ss-for) | List rendering |
| [ss-html](/directives/ss-html) | Render HTML content |

## Form & Binding

| Directive | Description |
|-----------|-------------|
| [ss-model](/directives/ss-model) | Two-way data binding |
| [ss-bind](/directives/ss-bind) | Attribute binding |
| [ss-on](/directives/ss-on) | Event handling |

## Utilities

| Directive | Description |
|-----------|-------------|
| [ss-ref](/directives/ss-ref) | Element references |
| [ss-effect](/directives/ss-effect) | Side effects |
| [ss-transition](/directives/ss-transition) | CSS transitions |
| [ss-teleport](/directives/ss-teleport) | Teleport content |
| [ss-init](/directives/ss-init) | Run on initialization |
| [ss-cloak](/directives/ss-cloak) | Hide until ready |

## Quick Examples

### Counter

```html
<div ss-data="{ count: 0 }">
  <button ss-on:click="count--">-</button>
  <span ss-text="count"></span>
  <button ss-on:click="count++">+</button>
</div>
```

### Toggle

```html
<div ss-data="{ open: false }">
  <button ss-on:click="open = !open" ss-text="open ? 'Hide' : 'Show'"></button>
  <div ss-show="open" ss-transition>Hidden content</div>
</div>
```

### List

```html
<div ss-data="{ items: ['A', 'B', 'C'] }">
  <template ss-for="item in items">
    <div ss-text="item"></div>
  </template>
</div>
```

### Form

```html
<div ss-data="{ name: '' }">
  <input ss-model="name" placeholder="Enter name">
  <p ss-text="'Hello, ' + (name || 'stranger')"></p>
</div>
```

::: tip Properties
For special properties like `$refs`, `$store`, `$el`, `$event`, and `$dispatch`, see the [Properties](/properties/) section.
:::
