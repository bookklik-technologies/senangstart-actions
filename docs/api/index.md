# API Reference

SenangStart Actions exposes a global `SenangStart` object with methods for registering components, stores, and initializing the framework.

## Methods

| Method | Description |
|--------|-------------|
| [data()](/api/data) | Register reusable data components |
| [store()](/api/store) | Register global reactive stores |
| [init()](/api/init) | Manually initialize a DOM tree |
| [start()](/api/start) | Start the framework |

## Quick Reference

```javascript
// Register a reusable component
SenangStart.data('counter', () => ({
  count: 0,
  increment() { this.count++ }
}))

// Register a global store
SenangStart.store('user', {
  name: 'Guest',
  isLoggedIn: false
})

// Manually initialize new content
SenangStart.init(element)

// Start the framework (auto-called)
SenangStart.start()
```

## Version

Access the current version:

```javascript
console.log(SenangStart.version) // "0.1.0"
```
