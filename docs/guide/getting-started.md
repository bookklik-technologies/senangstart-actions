# Getting Started

SenangStart Actions is a lightweight, declarative JavaScript framework for building reactive user interfaces without a build step.

## Installation

### CDN (Recommended)

Add the script tag to your HTML:

```html
<script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
```

Or use jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions"></script>
```

### npm

```bash
npm install @bookklik/senangstart-actions
```

```javascript
import SenangStart from '@bookklik/senangstart-actions'
```

## Basic Usage

### Reactive Data with `ss-data`

The `ss-data` attribute defines a reactive scope with initial data:

```html
<div ss-data="{ message: 'Hello, World!' }">
  <p ss-text="message"></p>
</div>
```

### Text Binding with `ss-text`

Use `ss-text` to bind data to element text content:

```html
<div ss-data="{ name: 'SenangStart' }">
  <h1 ss-text="'Welcome to ' + name"></h1>
</div>
```

### Event Handling with `ss-on`

Handle DOM events with `ss-on:eventname`:

```html
<div ss-data="{ count: 0 }">
  <p ss-text="count"></p>
  <button ss-on:click="count++">+</button>
  <button ss-on:click="count--">-</button>
</div>
```

## Your First App

Here's a complete counter example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First SenangStart App</title>
</head>
<body>
  <div ss-data="{ count: 0 }">
    <h1>Counter: <span ss-text="count">0</span></h1>
    <button ss-on:click="count++">Increment</button>
    <button ss-on:click="count--">Decrement</button>
    <button ss-on:click="count = 0">Reset</button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Next Steps

- Learn about all available [Directives](/directives/)
- Explore the [API Reference](/api/)
