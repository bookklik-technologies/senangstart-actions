# ss-effect

The `ss-effect` directive runs a side effect whenever its dependencies change. It's useful for logging, API calls, or any action that should happen in response to data changes.

## Syntax

```html
<element ss-effect="expression"></element>
```

## Basic Usage

### Logging Changes

```html
<div ss-data="{ count: 0 }" ss-effect="console.log('Count changed to:', count)">
  <button ss-on:click="count++">Increment</button>
  <p ss-text="count"></p>
</div>
```

Every time `count` changes, the console logs the new value.

### Multiple Dependencies

```html
<div ss-data="{ firstName: '', lastName: '' }" 
     ss-effect="console.log('Name:', firstName, lastName)">
  <input ss-model="firstName" placeholder="First name">
  <input ss-model="lastName" placeholder="Last name">
</div>
```

The effect runs when either `firstName` or `lastName` changes.

## Common Patterns

### Local Storage Sync

```html
<div ss-data="{ preferences: { theme: 'light', fontSize: 16 } }"
     ss-effect="localStorage.setItem('prefs', JSON.stringify(preferences))">
  <select ss-model="preferences.theme">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
  <input type="range" ss-model="preferences.fontSize" min="12" max="24">
</div>
```

### Document Title

```html
<div ss-data="{ pageTitle: 'Home' }"
     ss-effect="document.title = pageTitle + ' | My App'">
  <select ss-model="pageTitle">
    <option value="Home">Home</option>
    <option value="About">About</option>
    <option value="Contact">Contact</option>
  </select>
</div>
```

### Analytics Tracking

```html
<div ss-data="{ currentPage: 'home' }"
     ss-effect="analytics.track('page_view', { page: currentPage })">
  <nav>
    <button ss-on:click="currentPage = 'home'">Home</button>
    <button ss-on:click="currentPage = 'products'">Products</button>
    <button ss-on:click="currentPage = 'contact'">Contact</button>
  </nav>
</div>
```

### Debounced API Calls

```html
<div ss-data="{ 
  searchQuery: '',
  results: [],
  debounceTimer: null,
  search() {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      fetch('/api/search?q=' + this.searchQuery)
        .then(r => r.json())
        .then(data => this.results = data)
    }, 300)
  }
}" ss-effect="search()">
  <input ss-model="searchQuery" placeholder="Search...">
  <template ss-for="result in results">
    <div ss-text="result.name"></div>
  </template>
</div>
```

### CSS Custom Properties

```html
<div ss-data="{ primaryColor: '#007bff', secondaryColor: '#6c757d' }"
     ss-effect="
       document.documentElement.style.setProperty('--primary', primaryColor);
       document.documentElement.style.setProperty('--secondary', secondaryColor)
     ">
  <label>
    Primary: <input type="color" ss-model="primaryColor">
  </label>
  <label>
    Secondary: <input type="color" ss-model="secondaryColor">
  </label>
</div>
```

### Conditional Effects

```html
<div ss-data="{ 
  notifications: [],
  soundEnabled: true
}" ss-effect="if (soundEnabled && notifications.length) { new Audio('/notification.mp3').play() }">
  <button ss-on:click="notifications.push('New message')">
    Add Notification
  </button>
  <label>
    <input type="checkbox" ss-model="soundEnabled"> Sound
  </label>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-effect Example</title>
  <style>
    .log { font-family: monospace; background: #f5f5f5; padding: 1rem; max-height: 200px; overflow-y: auto; }
    .log-entry { padding: 0.25rem 0; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div ss-data="{ 
    value: 0,
    logs: [],
    addLog(msg) {
      this.logs.unshift({ time: new Date().toLocaleTimeString(), msg })
      if (this.logs.length > 10) this.logs.pop()
    }
  }" ss-effect="addLog('Value changed to ' + value)">
    <h2>Effect Logger</h2>
    
    <div>
      <button ss-on:click="value--">-</button>
      <span ss-text="value" style="margin: 0 1rem; font-size: 1.5rem;"></span>
      <button ss-on:click="value++">+</button>
    </div>
    
    <h3>Effect Log</h3>
    <div class="log">
      <template ss-for="log in logs">
        <div class="log-entry">
          <strong ss-text="log.time"></strong>: 
          <span ss-text="log.msg"></span>
        </div>
      </template>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Keep effects focused** - One effect should do one thing
2. **Avoid infinite loops** - Don't modify watched data in the effect
3. **Debounce expensive operations** - API calls, localStorage writes
4. **Use for side effects only** - Not for computed values

## Caveats

- Effects run immediately on initialization and then on every dependency change
- Be careful with effects that modify the same data they watch (infinite loops)
- Effects are scoped to the `ss-data` context

## Related Directives

- [ss-data](/directives/ss-data) - Provides the reactive data
- [ss-on](/directives/ss-on) - Event-triggered side effects (preferred for user actions)
