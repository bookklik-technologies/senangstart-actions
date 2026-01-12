# ss-show

The `ss-show` directive toggles the visibility of an element based on a condition. It uses CSS `display: none` to hide elements while keeping them in the DOM.

## Syntax

```html
<element ss-show="condition"></element>
```

## Basic Usage

```html
<div ss-data="{ isVisible: true }">
  <button ss-on:click="isVisible = !isVisible">Toggle</button>
  <div ss-show="isVisible">
    This content is visible when isVisible is true
  </div>
</div>
```

## With Expressions

Use any expression that evaluates to a truthy or falsy value:

```html
<div ss-data="{ count: 5, items: ['a', 'b'] }">
  <p ss-show="count > 0">Count is positive</p>
  <p ss-show="count === 0">Count is zero</p>
  <p ss-show="items.length">Has items</p>
  <p ss-show="!items.length">No items</p>
</div>
```

## ss-show vs ss-if

| Feature | ss-show | ss-if |
|---------|---------|-------|
| Element in DOM | Always | Only when true |
| Toggle cost | Low (CSS only) | Higher (DOM manipulation) |
| Initial render | Renders hidden | Doesn't render |
| Use case | Frequent toggles | Conditional content |

**Use `ss-show` when:**
- Content toggles frequently
- You need to preserve element state (form inputs, scroll position)

**Use `ss-if` when:**
- Content rarely changes
- You want to avoid initial render cost
- Content has expensive child components

## With Transitions

Add `ss-transition` for smooth animations:

```html
<div ss-data="{ open: false }">
  <button ss-on:click="open = !open">Toggle</button>
  
  <div ss-show="open" ss-transition>
    This fades in and out smoothly
  </div>
</div>
```

### Custom Transition Classes

Define custom CSS for transitions:

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: all 0.3s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .ss-enter-to,
  .ss-leave-from {
    opacity: 1;
    transform: translateY(0);
  }
</style>

<div ss-show="isOpen" ss-transition>
  Animated content
</div>
```

## Common Patterns

### Loading State

```html
<div ss-data="{ isLoading: false, data: null }">
  <button ss-on:click="isLoading = true; setTimeout(() => { data = 'Loaded!'; isLoading = false }, 1000)">
    Load Data
  </button>
  
  <div ss-show="isLoading">Loading...</div>
  <div ss-show="data && !isLoading" ss-text="data"></div>
</div>
```

### Error Messages

```html
<div ss-data="{ email: '', error: '' }">
  <input type="email" ss-model="email" 
         ss-on:blur="error = email.includes('@') ? '' : 'Invalid email'">
  
  <p ss-show="error" style="color: red;" ss-text="error"></p>
</div>
```

### Accordion / Collapsible

```html
<div ss-data="{ sections: [
  { title: 'Section 1', content: 'Content 1', open: false },
  { title: 'Section 2', content: 'Content 2', open: false }
]}">
  <template ss-for="section in sections">
    <div>
      <button ss-on:click="section.open = !section.open" ss-text="section.title"></button>
      <div ss-show="section.open" ss-transition ss-text="section.content"></div>
    </div>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-show Example</title>
  <style>
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 400px;
    }
    .ss-enter-active, .ss-leave-active {
      transition: opacity 0.2s ease;
    }
    .ss-enter-from, .ss-leave-to {
      opacity: 0;
    }
  </style>
</head>
<body>
  <div ss-data="{ showModal: false }">
    <button ss-on:click="showModal = true">Open Modal</button>
    
    <div ss-show="showModal" ss-transition class="modal-backdrop" 
         ss-on:click.self="showModal = false">
      <div class="modal">
        <h2>Modal Title</h2>
        <p>This is a modal dialog.</p>
        <button ss-on:click="showModal = false">Close</button>
      </div>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use for frequently toggled content** - Less overhead than `ss-if`
2. **Combine with `ss-transition`** - Better user experience
3. **Consider accessibility** - Hidden content may still be read by screen readers
4. **Use meaningful conditions** - `ss-show="hasData"` is clearer than `ss-show="x"`

## Related Directives

- [ss-if](/directives/ss-if) - Conditional rendering (removes from DOM)
- [ss-transition](/directives/ss-transition) - Animate show/hide
- [ss-cloak](/directives/ss-cloak) - Hide until initialized
