# Magic Properties

SenangStart Actions provides special "magic" properties that are available within any `ss-data` scope. These properties give you access to useful functionality without additional setup.

## $refs

Access DOM elements marked with `ss-ref`.

```html
<div ss-data="{}">
  <input type="text" ss-ref="nameInput">
  <button ss-on:click="$refs.nameInput.focus()">Focus</button>
  <button ss-on:click="$refs.nameInput.value = ''">Clear</button>
  <button ss-on:click="alert($refs.nameInput.value)">Get Value</button>
</div>
```

### Common Uses

```html
<div ss-data="{}">
  <!-- Focus management -->
  <input ss-ref="email" ss-on:keyup.enter="$refs.password.focus()">
  <input ss-ref="password" type="password">
  
  <!-- Form reset -->
  <form ss-ref="form">
    <input name="field1">
    <button type="button" ss-on:click="$refs.form.reset()">Reset</button>
  </form>
  
  <!-- Media control -->
  <video ss-ref="video" src="video.mp4"></video>
  <button ss-on:click="$refs.video.play()">Play</button>
  <button ss-on:click="$refs.video.pause()">Pause</button>
  
  <!-- Scroll to element -->
  <button ss-on:click="$refs.section.scrollIntoView({ behavior: 'smooth' })">
    Go to Section
  </button>
  <div ss-ref="section">Target Section</div>
</div>
```

---

## $store

Access global stores registered with `SenangStart.store()`.

### Registering a Store

```javascript
SenangStart.store('user', {
  name: 'Guest',
  isLoggedIn: false,
  login(name) {
    this.name = name
    this.isLoggedIn = true
  },
  logout() {
    this.name = 'Guest'
    this.isLoggedIn = false
  }
})

SenangStart.store('cart', {
  items: [],
  add(item) {
    this.items.push(item)
  },
  get total() {
    return this.items.reduce((sum, item) => sum + item.price, 0)
  }
})
```

### Using in HTML

```html
<div ss-data="{}">
  <!-- Read store values -->
  <p ss-text="'Welcome, ' + $store.user.name"></p>
  
  <!-- Call store methods -->
  <button ss-show="!$store.user.isLoggedIn" 
          ss-on:click="$store.user.login('John')">
    Login
  </button>
  <button ss-show="$store.user.isLoggedIn"
          ss-on:click="$store.user.logout()">
    Logout
  </button>
  
  <!-- Access computed properties -->
  <p ss-text="'Cart total: $' + $store.cart.total"></p>
</div>
```

### Cross-Component Communication

```html
<!-- Header component -->
<header ss-data="{}">
  <span ss-text="$store.cart.items.length + ' items'"></span>
</header>

<!-- Product listing -->
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
    <div ss-text="item.name + ' - $' + item.price"></div>
  </template>
  <p ss-text="'Total: $' + $store.cart.total"></p>
</aside>
```

---

## $el

Reference to the current DOM element.

```html
<div ss-data="{}">
  <!-- Toggle class on self -->
  <div ss-on:click="$el.classList.toggle('active')">
    Click to toggle active class
  </div>
  
  <!-- Get element dimensions -->
  <div ss-on:click="alert('Width: ' + $el.offsetWidth)">
    Click to see width
  </div>
  
  <!-- Style manipulation -->
  <div ss-on:mouseenter="$el.style.backgroundColor = 'yellow'"
       ss-on:mouseleave="$el.style.backgroundColor = ''">
    Hover me
  </div>
</div>
```

---

## $event

Access the native DOM event object in event handlers.

```html
<div ss-data="{ lastClick: '' }">
  <!-- Get event properties -->
  <div ss-on:click="lastClick = 'X: ' + $event.clientX + ', Y: ' + $event.clientY">
    Click anywhere
  </div>
  <p ss-text="lastClick"></p>
  
  <!-- Prevent default explicitly -->
  <a href="/somewhere" ss-on:click="$event.preventDefault(); handleClick()">
    Custom Link
  </a>
  
  <!-- Access input value -->
  <input ss-on:input="console.log($event.target.value)">
  
  <!-- Keyboard events -->
  <input ss-on:keydown="if ($event.key === 'Enter') submit()">
</div>
```

---

## $dispatch

Dispatch custom DOM events that bubble up the tree.

### Basic Usage

```html
<div ss-data="{ message: '' }" ss-on:notify="message = $event.detail.text">
  <p ss-text="message || 'No message yet'"></p>
  
  <button ss-on:click="$dispatch('notify', { text: 'Hello from button!' })">
    Send Message
  </button>
</div>
```

### Parent-Child Communication

```html
<!-- Parent -->
<div ss-data="{ items: [] }" ss-on:item-added="items.push($event.detail)">
  <h2>Items: <span ss-text="items.length"></span></h2>
  <ul>
    <template ss-for="item in items">
      <li ss-text="item.name"></li>
    </template>
  </ul>
  
  <!-- Child component -->
  <div ss-data="{ newItem: '' }">
    <input ss-model="newItem" placeholder="Item name">
    <button ss-on:click="
      if (newItem) {
        $dispatch('item-added', { name: newItem });
        newItem = ''
      }
    ">Add Item</button>
  </div>
</div>
```

### Modal/Dialog Pattern

```html
<div ss-data="{ showModal: false }" ss-on:close-modal="showModal = false">
  <button ss-on:click="showModal = true">Open Modal</button>
  
  <template ss-if="showModal">
    <div class="modal-backdrop">
      <div class="modal" ss-data="{}">
        <h2>Modal Title</h2>
        <p>Modal content</p>
        <button ss-on:click="$dispatch('close-modal')">Close</button>
      </div>
    </div>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Magic Properties Example</title>
  <style>
    .notification { 
      padding: 1rem; 
      background: #d4edda; 
      border-radius: 4px;
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <script>
    // Register global store
    SenangStart.store('notifications', {
      items: [],
      add(message) {
        this.items.push({ id: Date.now(), message })
      },
      remove(id) {
        this.items = this.items.filter(n => n.id !== id)
      }
    })
  </script>

  <!-- Notification display -->
  <div ss-data="{}">
    <h3>Notifications</h3>
    <template ss-for="notification in $store.notifications.items">
      <div class="notification">
        <span ss-text="notification.message"></span>
        <button ss-on:click="$store.notifications.remove(notification.id)">×</button>
      </div>
    </template>
  </div>

  <!-- Form that adds notifications -->
  <div ss-data="{ message: '' }" 
       ss-on:notify="$store.notifications.add($event.detail.message)">
    <input ss-ref="input" ss-model="message" placeholder="Enter message">
    <button ss-on:click="
      if (message) {
        $dispatch('notify', { message: message });
        message = '';
        $refs.input.focus()
      }
    ">Add Notification</button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Summary

| Property | Purpose | Example |
|----------|---------|---------|
| `$refs` | Access elements by reference | `$refs.input.focus()` |
| `$store` | Access global stores | `$store.user.name` |
| `$el` | Current element | `$el.classList.add('active')` |
| `$event` | Native event object | `$event.target.value` |
| `$dispatch` | Emit custom events | `$dispatch('save', data)` |

## Related

- [ss-ref](/directives/ss-ref) - Define element references
- [ss-on](/directives/ss-on) - Event handling
- [API Reference](/api/) - `SenangStart.store()`
