# ss-if

The `ss-if` directive conditionally renders an element based on a condition. Unlike `ss-show`, it completely adds or removes elements from the DOM.

## Syntax

```html
<template ss-if="condition">
  <!-- content to render when condition is true -->
</template>
```

::: warning Important
`ss-if` must be used on a `<template>` element. The template's content will be rendered when the condition is true.
:::

## Basic Usage

```html
<div ss-data="{ loggedIn: false }">
  <template ss-if="loggedIn">
    <div>Welcome back!</div>
  </template>
  
  <template ss-if="!loggedIn">
    <div>Please log in</div>
  </template>
  
  <button ss-on:click="loggedIn = !loggedIn">
    Toggle Login
  </button>
</div>
```

## With Expressions

```html
<div ss-data="{ role: 'admin' }">
  <template ss-if="role === 'admin'">
    <div>Admin Panel</div>
  </template>
  
  <template ss-if="role === 'user'">
    <div>User Dashboard</div>
  </template>
  
  <template ss-if="role === 'guest'">
    <div>Guest View</div>
  </template>
</div>
```

## Multiple Elements

A single `<template>` can contain multiple elements:

```html
<div ss-data="{ showDetails: true }">
  <template ss-if="showDetails">
    <h2>Details</h2>
    <p>First paragraph</p>
    <p>Second paragraph</p>
    <button>Action</button>
  </template>
</div>
```

## Nested Conditions

```html
<div ss-data="{ user: { isAdmin: true, permissions: ['read', 'write'] } }">
  <template ss-if="user">
    <div>
      <p>User exists</p>
      
      <template ss-if="user.isAdmin">
        <p>User is admin</p>
        
        <template ss-if="user.permissions.includes('write')">
          <button>Edit</button>
        </template>
      </template>
    </div>
  </template>
</div>
```

## ss-if vs ss-show

| Aspect | ss-if | ss-show |
|--------|-------|---------|
| DOM presence | Removed when false | Always present |
| Performance | Higher toggle cost | Lower toggle cost |
| Initial load | Faster if false | Renders all |
| State preservation | Loses state | Preserves state |

### When to use ss-if

```html
<!-- Good: Expensive component, rarely shown -->
<template ss-if="showChart">
  <div class="complex-chart">...</div>
</template>

<!-- Good: User role-based content -->
<template ss-if="user.isAdmin">
  <admin-panel></admin-panel>
</template>
```

### When to use ss-show

```html
<!-- Good: Frequently toggled, simple content -->
<div ss-show="isMenuOpen">
  <nav>...</nav>
</div>

<!-- Good: Need to preserve form state -->
<form ss-show="isEditing">
  <input ss-model="name">
</form>
```

## Common Patterns

### Authentication State

```html
<div ss-data="{ user: null }">
  <template ss-if="user">
    <header>
      <span ss-text="'Welcome, ' + user.name"></span>
      <button ss-on:click="user = null">Logout</button>
    </header>
  </template>
  
  <template ss-if="!user">
    <button ss-on:click="user = { name: 'John' }">Login</button>
  </template>
</div>
```

### Empty State

```html
<div ss-data="{ items: [] }">
  <template ss-if="items.length === 0">
    <div class="empty-state">
      <p>No items yet</p>
      <button>Add your first item</button>
    </div>
  </template>
  
  <template ss-if="items.length > 0">
    <ul>
      <template ss-for="item in items">
        <li ss-text="item"></li>
      </template>
    </ul>
  </template>
</div>
```

### Feature Flags

```html
<div ss-data="{ features: { darkMode: true, beta: false } }">
  <template ss-if="features.darkMode">
    <button>Toggle Dark Mode</button>
  </template>
  
  <template ss-if="features.beta">
    <span class="badge">Beta Feature</span>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-if Example</title>
  <style>
    .step { padding: 1rem; border: 1px solid #ddd; margin: 1rem 0; }
    .nav { display: flex; gap: 1rem; }
  </style>
</head>
<body>
  <div ss-data="{ currentStep: 1, maxSteps: 3 }">
    <div class="nav">
      <button ss-on:click="currentStep = Math.max(1, currentStep - 1)" 
              ss-bind:disabled="currentStep === 1">
        Previous
      </button>
      <span ss-text="`Step ${currentStep} of ${maxSteps}`"></span>
      <button ss-on:click="currentStep = Math.min(maxSteps, currentStep + 1)"
              ss-bind:disabled="currentStep === maxSteps">
        Next
      </button>
    </div>
    
    <template ss-if="currentStep === 1">
      <div class="step">
        <h2>Step 1: Personal Info</h2>
        <input placeholder="Your name">
      </div>
    </template>
    
    <template ss-if="currentStep === 2">
      <div class="step">
        <h2>Step 2: Contact</h2>
        <input placeholder="Your email">
      </div>
    </template>
    
    <template ss-if="currentStep === 3">
      <div class="step">
        <h2>Step 3: Confirm</h2>
        <p>Review your information</p>
        <button>Submit</button>
      </div>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use `<template>` tag** - Required for ss-if to work correctly
2. **Prefer ss-if for expensive content** - Avoids unnecessary rendering
3. **Group related conditions** - Makes code more readable
4. **Consider ss-show for simple toggles** - Better performance for frequent changes

## Related Directives

- [ss-show](/directives/ss-show) - Toggle visibility without removing from DOM
- [ss-for](/directives/ss-for) - Render lists conditionally
- [ss-data](/directives/ss-data) - Provide data for conditions
