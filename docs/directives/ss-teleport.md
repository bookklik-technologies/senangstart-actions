# ss-teleport

The `ss-teleport` directive allows you to move (teleport) part of your template to another DOM entry point (like the `<body>` tag), while maintaining the logic and reactivity scope of where it was defined. This is useful for modals, tooltips, and floating menus that need to break out of their parent's `z-index` or `overflow: hidden` constraints.

## Syntax

```html
<template ss-teleport="selector">...</template>
```

The value must be a valid CSS selector string (e.g., `'body'`, `'#modals'`, `'.footer'`).

## Basic Usage

### Modal Example

```html
<div ss-data="{ open: false }">
    <button ss-on:click="open = true">Open Modal</button>

    <!-- Content inside here is logically part of the component, 
         but technically rendered at the end of <body> -->
    <template ss-teleport="body">
        <div class="modal-wrapper" ss-show="open">
            <div class="modal-content">
                <h2>I am in the Body!</h2>
                <button ss-on:click="open = false">Close</button>
            </div>
        </div>
    </template>
</div>
```

## Behavior

1. **Reactivity Preservation**: Even though the DOM nodes are moved, they share the exact same `scope` as the parent component. Updating `open` in the parent correctly updates the teleported content.
2. **Event Bubbling**: Native DOM events will bubble up the DOM tree from the *teleported location*, not the template location. However, `ss-action` dispatches events usually targeting specific data processing, which works seamlessly via scope.
3. **Mount Point**: The target element must exist in the DOM when the component initializes. Using `'body'` is the safest and most common choice.

## Best Practices

- Always use `<template>` tag for teleportation to prevent the content from rendering in the original location before teleporting.
- Ensure the target selector is unique if targeting an ID.
