# SenangStart.start()

Start the SenangStart framework. This method is called automatically when the script loads, but can be called manually if needed.

## Syntax

```javascript
SenangStart.start()
```

## Returns

`SenangStart` - Returns the SenangStart object for method chaining.

## Auto-Start Behavior

When you include the SenangStart script, it automatically:

1. Waits for DOM to be ready (`DOMContentLoaded`)
2. Calls `init(document.body)` to process all `ss-*` attributes
3. Sets up a MutationObserver to watch for dynamic content

```html
<!-- SenangStart auto-starts when this loads -->
<script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
```

## When to Call Manually

You typically don't need to call `start()` yourself. However, you might use it if:

### Deferred Loading

```javascript
// Load SenangStart as a module without auto-start
import SenangStart from '@bookklik/senangstart-actions/core'

// Register components first
SenangStart.data('myComponent', () => ({ ... }))
SenangStart.store('myStore', { ... })

// Then start manually
SenangStart.start()
```

### Testing

```javascript
// In test setup
beforeEach(() => {
  document.body.innerHTML = `
    <div ss-data="{ count: 0 }">
      <span id="count" ss-text="count"></span>
    </div>
  `
  SenangStart.start()
})
```

## What start() Does

1. **Checks document ready state**
   - If loading, waits for `DOMContentLoaded`
   - If already ready, proceeds immediately

2. **Initializes the DOM**
   - Calls `init(document.body)`
   - Processes all `ss-*` attributes

3. **Sets up observer**
   - Watches for dynamically added content
   - Auto-initializes new elements with `ss-*` attributes

## Method Chaining

```javascript
SenangStart
  .data('counter', () => ({ count: 0 }))
  .store('app', { name: 'MyApp' })
  .start()
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>SenangStart.start() Example</title>
</head>
<body>
  <div ss-data="{ message: 'Hello!' }">
    <p ss-text="message"></p>
  </div>

  <script>
    // Define components before loading the framework
    window.SenangStartConfig = {
      components: {
        greeting: () => ({ name: 'World' })
      }
    }
  </script>
  
  <!-- Framework auto-starts on load -->
  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Related

- [init()](/api/init) - Manual initialization for dynamic content
- [data()](/api/data) - Register components before start
- [store()](/api/store) - Register stores before start
