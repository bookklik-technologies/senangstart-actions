# $store

Access global stores that were registered with `SenangStart.store()`.

## Syntax

```javascript
$store.storeName.property
$store.storeName.method()
```

## How It Works

1. Register a store with `SenangStart.store(name, data)`
2. Access it via `$store.name` in any component

```javascript
SenangStart.store('user', {
  name: 'Guest',
  isLoggedIn: false
})
```

```html
<div ss-data="{}">
  <p ss-text="'Hello, ' + $store.user.name"></p>
</div>
```

## Reading Store Values

```javascript
SenangStart.store('app', {
  name: 'My Application',
  version: '1.0.0',
  debug: false
})
```

```html
<div ss-data="{}">
  <h1 ss-text="$store.app.name"></h1>
  <span ss-text="'v' + $store.app.version"></span>
  <div ss-show="$store.app.debug">Debug Mode</div>
</div>
```

## Calling Store Methods

```javascript
SenangStart.store('counter', {
  value: 0,
  increment() { this.value++ },
  decrement() { this.value-- },
  reset() { this.value = 0 }
})
```

```html
<div ss-data="{}">
  <span ss-text="$store.counter.value"></span>
  <button ss-on:click="$store.counter.increment()">+</button>
  <button ss-on:click="$store.counter.decrement()">-</button>
  <button ss-on:click="$store.counter.reset()">Reset</button>
</div>
```

## Updating Store Properties

```javascript
SenangStart.store('settings', {
  theme: 'light',
  language: 'en'
})
```

```html
<div ss-data="{}">
  <select ss-model="$store.settings.theme">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
  
  <select ss-model="$store.settings.language">
    <option value="en">English</option>
    <option value="ms">Bahasa Melayu</option>
  </select>
</div>
```

## Cross-Component Sharing

The main benefit of stores is sharing state across unrelated components:

```javascript
SenangStart.store('cart', {
  items: [],
  add(item) { this.items.push(item) },
  get total() { 
    return this.items.reduce((sum, i) => sum + i.price, 0) 
  }
})
```

```html
<!-- Header (anywhere on page) -->
<header ss-data="{}">
  Cart: <span ss-text="$store.cart.items.length"></span> items
  ($<span ss-text="$store.cart.total.toFixed(2)"></span>)
</header>

<!-- Product listing (separate component) -->
<div ss-data="{ products: [...] }">
  <template ss-for="product in products">
    <div>
      <span ss-text="product.name"></span>
      <button ss-on:click="$store.cart.add(product)">Add</button>
    </div>
  </template>
</div>

<!-- Cart page (separate component) -->
<div ss-data="{}">
  <template ss-for="item in $store.cart.items">
    <div ss-text="item.name + ' - $' + item.price"></div>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>$store Example</title>
</head>
<body>
  <script>
    SenangStart.store('todos', {
      items: [
        { text: 'Learn SenangStart', done: true },
        { text: 'Build an app', done: false }
      ],
      add(text) {
        this.items.push({ text, done: false })
      },
      toggle(index) {
        this.items[index].done = !this.items[index].done
      },
      get remaining() {
        return this.items.filter(i => !i.done).length
      }
    })
  </script>

  <!-- Stats display -->
  <div ss-data="{}">
    <h2>Todo Stats</h2>
    <p>Total: <span ss-text="$store.todos.items.length"></span></p>
    <p>Remaining: <span ss-text="$store.todos.remaining"></span></p>
  </div>

  <!-- Todo list -->
  <div ss-data="{ newTodo: '' }">
    <h2>Todos</h2>
    <input ss-model="newTodo" ss-on:keyup.enter="$store.todos.add(newTodo); newTodo = ''">
    <button ss-on:click="$store.todos.add(newTodo); newTodo = ''">Add</button>
    
    <template ss-for="(todo, i) in $store.todos.items">
      <div>
        <input type="checkbox" ss-model="todo.done">
        <span ss-text="todo.text" ss-bind:style="todo.done ? 'text-decoration: line-through' : ''"></span>
      </div>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use for shared state** - Local state should use `ss-data`
2. **Keep stores focused** - One store per domain (user, cart, settings)
3. **Use methods for complex updates** - Encapsulate logic in the store
4. **Computed properties** - Use getters for derived values

## Related

- [store() API](/api/store) - How to register stores
- [$refs property](/properties/refs) - Element references
