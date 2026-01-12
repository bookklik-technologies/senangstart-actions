# SenangStart.data()

Register a reusable data component that can be referenced by name in `ss-data` attributes.

## Syntax

```javascript
SenangStart.data(name, factory)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The component name to register |
| `factory` | function | Factory function that returns the data object |

## Returns

`SenangStart` - Returns the SenangStart object for method chaining.

## Basic Usage

```javascript
SenangStart.data('counter', () => ({
  count: 0,
  increment() {
    this.count++
  },
  decrement() {
    this.count--
  },
  reset() {
    this.count = 0
  }
}))
```

```html
<div ss-data="counter">
  <p ss-text="count"></p>
  <button ss-on:click="increment()">+</button>
  <button ss-on:click="decrement()">-</button>
  <button ss-on:click="reset()">Reset</button>
</div>
```

## Why Use Named Components?

### 1. Reusability

Use the same component logic across multiple elements:

```javascript
SenangStart.data('dropdown', () => ({
  open: false,
  toggle() { this.open = !this.open },
  close() { this.open = false }
}))
```

```html
<!-- Multiple instances, each with its own state -->
<div ss-data="dropdown">
  <button ss-on:click="toggle()">Menu 1</button>
  <ul ss-show="open">...</ul>
</div>

<div ss-data="dropdown">
  <button ss-on:click="toggle()">Menu 2</button>
  <ul ss-show="open">...</ul>
</div>
```

### 2. Cleaner HTML

Move complex logic out of attributes:

```html
<!-- Instead of this -->
<div ss-data="{ 
  items: [], 
  newItem: '', 
  addItem() { if(this.newItem.trim()) { this.items.push(this.newItem); this.newItem = '' } },
  removeItem(i) { this.items.splice(i, 1) }
}">

<!-- Use this -->
<div ss-data="todoList">
```

### 3. Testability

Component logic can be tested independently:

```javascript
// Component definition
SenangStart.data('calculator', () => ({
  a: 0,
  b: 0,
  get sum() { return this.a + this.b },
  get product() { return this.a * this.b }
}))
```

## Advanced Patterns

### With Initialization

```javascript
SenangStart.data('userProfile', () => ({
  user: null,
  loading: true,
  error: null,
  
  async init() {
    try {
      const response = await fetch('/api/user')
      this.user = await response.json()
    } catch (e) {
      this.error = e.message
    } finally {
      this.loading = false
    }
  }
}))
```

### With Computed Properties

```javascript
SenangStart.data('cart', () => ({
  items: [],
  
  get itemCount() {
    return this.items.length
  },
  
  get total() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },
  
  get isEmpty() {
    return this.items.length === 0
  }
}))
```

### With External Dependencies

```javascript
SenangStart.data('analytics', () => ({
  pageViews: 0,
  
  trackView() {
    this.pageViews++
    // Call external analytics
    gtag('event', 'page_view', { count: this.pageViews })
  }
}))
```

## Method Chaining

Chain multiple registrations:

```javascript
SenangStart
  .data('dropdown', () => ({ open: false, toggle() { this.open = !this.open } }))
  .data('modal', () => ({ visible: false, show() { this.visible = true } }))
  .data('tabs', () => ({ active: 0, select(i) { this.active = i } }))
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>SenangStart.data() Example</title>
</head>
<body>
  <script>
    SenangStart.data('todoApp', () => ({
      todos: [],
      newTodo: '',
      filter: 'all',
      
      get filtered() {
        if (this.filter === 'active') return this.todos.filter(t => !t.done)
        if (this.filter === 'done') return this.todos.filter(t => t.done)
        return this.todos
      },
      
      add() {
        if (this.newTodo.trim()) {
          this.todos.push({ text: this.newTodo, done: false })
          this.newTodo = ''
        }
      },
      
      remove(index) {
        this.todos.splice(index, 1)
      },
      
      toggleAll() {
        const allDone = this.todos.every(t => t.done)
        this.todos.forEach(t => t.done = !allDone)
      }
    }))
  </script>

  <div ss-data="todoApp">
    <input ss-model="newTodo" ss-on:keyup.enter="add()" placeholder="Add todo...">
    <button ss-on:click="add()">Add</button>
    
    <div>
      <button ss-on:click="filter = 'all'">All</button>
      <button ss-on:click="filter = 'active'">Active</button>
      <button ss-on:click="filter = 'done'">Done</button>
    </div>
    
    <template ss-for="(todo, i) in filtered">
      <div>
        <input type="checkbox" ss-model="todo.done">
        <span ss-text="todo.text" ss-bind:style="todo.done ? 'text-decoration: line-through' : ''"></span>
        <button ss-on:click="remove(i)">×</button>
      </div>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Related

- [ss-data directive](/directives/ss-data) - Using components in HTML
- [store()](/api/store) - Global state management
