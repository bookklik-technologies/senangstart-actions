# ss-transition

The `ss-transition` directive enables CSS transitions when elements are shown or hidden with `ss-show`. It applies transition classes that you can style with CSS.

## Syntax

```html
<element ss-show="condition" ss-transition></element>
```

## How It Works

When an element with `ss-transition` is shown or hidden, SenangStart applies the following classes:

### Enter (showing)
1. `ss-enter-from` - Initial state before entering
2. `ss-enter-active` - Applied during the entire enter phase
3. `ss-enter-to` - Final state after entering

### Leave (hiding)
1. `ss-leave-from` - Initial state before leaving
2. `ss-leave-active` - Applied during the entire leave phase
3. `ss-leave-to` - Final state after leaving

## Basic Usage

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
  }
</style>

<div ss-data="{ show: true }">
  <button ss-on:click="show = !show">Toggle</button>
  <div ss-show="show" ss-transition>
    This content fades in and out
  </div>
</div>
```

## Transition Examples

### Fade

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
  }
</style>
```

### Slide Down

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
```

### Scale

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: all 0.2s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }
</style>
```

### Slide and Fade

```html
<style>
  .ss-enter-active {
    transition: all 0.3s ease-out;
  }
  
  .ss-leave-active {
    transition: all 0.2s ease-in;
  }
  
  .ss-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }
  
  .ss-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
</style>
```

## Common Patterns

### Modal Dialog

```html
<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ss-enter-active,
  .ss-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
  }
</style>

<div ss-data="{ isOpen: false }">
  <button ss-on:click="isOpen = true">Open Modal</button>
  
  <div ss-show="isOpen" ss-transition class="modal-backdrop"
       ss-on:click.self="isOpen = false">
    <div class="modal">
      <h2>Modal Title</h2>
      <p>Modal content here</p>
      <button ss-on:click="isOpen = false">Close</button>
    </div>
  </div>
</div>
```

### Dropdown Menu

```html
<style>
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  
  .ss-enter-active,
  .ss-leave-active {
    transition: all 0.15s ease;
    transform-origin: top;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
    transform: scaleY(0.95);
  }
</style>

<div ss-data="{ open: false }" style="position: relative;">
  <button ss-on:click="open = !open">Menu ▼</button>
  
  <div ss-show="open" ss-transition class="dropdown-menu">
    <a href="#">Option 1</a>
    <a href="#">Option 2</a>
    <a href="#">Option 3</a>
  </div>
</div>
```

### Notification Toast

```html
<style>
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 2rem;
    background: #333;
    color: white;
    border-radius: 8px;
  }
  
  .ss-enter-active {
    transition: all 0.3s ease-out;
  }
  
  .ss-leave-active {
    transition: all 0.2s ease-in;
  }
  
  .ss-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .ss-leave-to {
    opacity: 0;
    transform: translateX(100px);
  }
</style>

<div ss-data="{ message: '', show: false }">
  <button ss-on:click="message = 'Saved!'; show = true; setTimeout(() => show = false, 3000)">
    Save
  </button>
  
  <div ss-show="show" ss-transition class="toast" ss-text="message"></div>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-transition Example</title>
  <style>
    .accordion-content {
      overflow: hidden;
    }
    
    .ss-enter-active,
    .ss-leave-active {
      transition: all 0.3s ease;
    }
    
    .ss-enter-from,
    .ss-leave-to {
      opacity: 0;
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
    
    .ss-enter-to,
    .ss-leave-from {
      max-height: 200px;
    }
    
    .accordion-item {
      border: 1px solid #ddd;
      margin-bottom: 0.5rem;
    }
    
    .accordion-header {
      padding: 1rem;
      cursor: pointer;
      background: #f5f5f5;
    }
    
    .accordion-body {
      padding: 1rem;
    }
  </style>
</head>
<body>
  <div ss-data="{ 
    items: [
      { title: 'Section 1', content: 'Content for section 1', open: false },
      { title: 'Section 2', content: 'Content for section 2', open: false },
      { title: 'Section 3', content: 'Content for section 3', open: false }
    ]
  }">
    <template ss-for="item in items">
      <div class="accordion-item">
        <div class="accordion-header" ss-on:click="item.open = !item.open">
          <span ss-text="item.title"></span>
          <span ss-text="item.open ? '▲' : '▼'" style="float: right;"></span>
        </div>
        <div ss-show="item.open" ss-transition class="accordion-content">
          <div class="accordion-body" ss-text="item.content"></div>
        </div>
      </div>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Match enter/leave durations** - Usually the same, but leave can be faster
2. **Use appropriate easing** - `ease-out` for enter, `ease-in` for leave
3. **Keep transitions short** - 200-300ms feels responsive
4. **Test on slow devices** - Ensure transitions don't feel sluggish

## Related Directives

- [ss-show](/directives/ss-show) - Control visibility
- [ss-if](/directives/ss-if) - Conditional rendering (no transitions)
