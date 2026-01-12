# SenangStart.store()

Register a global reactive store that can be accessed from any component using `$store`.

## Syntax

```javascript
SenangStart.store(name, data)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The store name |
| `data` | object | The store data object with properties and methods |

## Returns

`SenangStart` - Returns the SenangStart object for method chaining.

## Basic Usage

```javascript
SenangStart.store('user', {
  name: 'Guest',
  email: '',
  isLoggedIn: false
})
```

```html
<div ss-data="{}">
  <p ss-text="'Welcome, ' + $store.user.name"></p>
  <p ss-show="$store.user.isLoggedIn" ss-text="$store.user.email"></p>
</div>
```

## With Methods

```javascript
SenangStart.store('auth', {
  user: null,
  isLoggedIn: false,
  
  login(userData) {
    this.user = userData
    this.isLoggedIn = true
  },
  
  logout() {
    this.user = null
    this.isLoggedIn = false
  },
  
  updateProfile(data) {
    Object.assign(this.user, data)
  }
})
```

```html
<div ss-data="{}">
  <template ss-if="!$store.auth.isLoggedIn">
    <button ss-on:click="$store.auth.login({ name: 'John', email: 'john@example.com' })">
      Login
    </button>
  </template>
  
  <template ss-if="$store.auth.isLoggedIn">
    <p ss-text="'Hello, ' + $store.auth.user.name"></p>
    <button ss-on:click="$store.auth.logout()">Logout</button>
  </template>
</div>
```

## Use Cases

### Shopping Cart

```javascript
SenangStart.store('cart', {
  items: [],
  
  add(product) {
    const existing = this.items.find(i => i.id === product.id)
    if (existing) {
      existing.qty++
    } else {
      this.items.push({ ...product, qty: 1 })
    }
  },
  
  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId)
  },
  
  updateQty(productId, qty) {
    const item = this.items.find(i => i.id === productId)
    if (item) item.qty = Math.max(0, qty)
  },
  
  clear() {
    this.items = []
  },
  
  get total() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },
  
  get count() {
    return this.items.reduce((sum, item) => sum + item.qty, 0)
  }
})
```

### Theme Settings

```javascript
SenangStart.store('theme', {
  mode: 'light',
  primaryColor: '#007bff',
  fontSize: 16,
  
  toggle() {
    this.mode = this.mode === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', this.mode === 'dark')
  },
  
  setColor(color) {
    this.primaryColor = color
    document.documentElement.style.setProperty('--primary', color)
  }
})
```

### Notifications

```javascript
SenangStart.store('notifications', {
  items: [],
  nextId: 1,
  
  add(message, type = 'info') {
    const id = this.nextId++
    this.items.push({ id, message, type })
    
    // Auto-remove after 5 seconds
    setTimeout(() => this.remove(id), 5000)
  },
  
  remove(id) {
    this.items = this.items.filter(n => n.id !== id)
  },
  
  success(message) { this.add(message, 'success') },
  error(message) { this.add(message, 'error') },
  warning(message) { this.add(message, 'warning') }
})
```

## Cross-Component Communication

Stores enable communication between unrelated components:

```html
<!-- Header component -->
<header ss-data="{}">
  <span ss-text="$store.cart.count + ' items'"></span>
  <span ss-text="'$' + $store.cart.total.toFixed(2)"></span>
</header>

<!-- Product list -->
<div ss-data="{ products: [...] }">
  <template ss-for="product in products">
    <div>
      <span ss-text="product.name"></span>
      <button ss-on:click="$store.cart.add(product)">Add to Cart</button>
    </div>
  </template>
</div>

<!-- Cart sidebar -->
<aside ss-data="{}">
  <template ss-for="item in $store.cart.items">
    <div>
      <span ss-text="item.name"></span>
      <span ss-text="'$' + item.price + ' × ' + item.qty"></span>
    </div>
  </template>
  <button ss-on:click="$store.cart.clear()">Clear Cart</button>
</aside>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>SenangStart.store() Example</title>
  <style>
    .notification { padding: 1rem; margin: 0.5rem 0; border-radius: 4px; }
    .notification.success { background: #d4edda; color: #155724; }
    .notification.error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <script>
    SenangStart.store('notifications', {
      items: [],
      nextId: 1,
      add(message, type = 'info') {
        const id = this.nextId++
        this.items.push({ id, message, type })
        setTimeout(() => this.remove(id), 3000)
      },
      remove(id) {
        this.items = this.items.filter(n => n.id !== id)
      }
    })
  </script>

  <!-- Notification display (separate component) -->
  <div ss-data="{}" style="position: fixed; top: 20px; right: 20px;">
    <template ss-for="n in $store.notifications.items">
      <div class="notification" ss-bind:class="n.type">
        <span ss-text="n.message"></span>
        <button ss-on:click="$store.notifications.remove(n.id)">×</button>
      </div>
    </template>
  </div>

  <!-- Form that triggers notifications -->
  <div ss-data="{ email: '' }">
    <input ss-model="email" placeholder="Enter email">
    <button ss-on:click="
      if (email.includes('@')) {
        $store.notifications.add('Saved successfully!', 'success')
      } else {
        $store.notifications.add('Invalid email', 'error')
      }
    ">Save</button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Related

- [data()](/api/data) - Register local component data
- [$store property](/properties/store) - Accessing stores in templates
