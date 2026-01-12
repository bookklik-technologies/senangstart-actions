# ss-cloak

The `ss-cloak` directive hides an element until SenangStart has finished initializing it. This prevents the "flash of unrendered content" (FOUC) where users briefly see template syntax before it's replaced with actual data.

## Syntax

```html
<element ss-cloak>...</element>
```

## Required CSS

For `ss-cloak` to work, you must define the following CSS rule:

```html
<style>
  [ss-cloak] { display: none !important; }
</style>
```

::: tip
SenangStart automatically injects this CSS rule, but you can also add it manually for earlier hiding.
:::

## Basic Usage

```html
<style>
  [ss-cloak] { display: none !important; }
</style>

<div ss-cloak ss-data="{ message: 'Hello, World!' }">
  <h1 ss-text="message">Loading...</h1>
</div>
```

Without `ss-cloak`, users might briefly see "Loading..." before "Hello, World!" appears.

## When to Use

### Preventing Template Flash

```html
<!-- Without ss-cloak: Users see "{{ name }}" briefly -->
<span ss-text="name">{{ name }}</span>

<!-- With ss-cloak: Hidden until ready -->
<span ss-cloak ss-text="name">{{ name }}</span>
```

### Complex Expressions

```html
<div ss-cloak ss-data="{ items: [] }">
  <!-- Prevents showing "0 items" or other initial states -->
  <p ss-text="items.length + ' items found'"></p>
</div>
```

### Page Headers

```html
<header ss-cloak ss-data="{ user: null }">
  <template ss-if="user">
    <span ss-text="'Welcome, ' + user.name"></span>
  </template>
  <template ss-if="!user">
    <a href="/login">Login</a>
  </template>
</header>
```

## Where to Place

### On Individual Elements

```html
<p ss-cloak ss-text="dynamicContent">Placeholder</p>
```

### On Container

```html
<div ss-cloak ss-data="{ ... }">
  <p ss-text="title"></p>
  <p ss-text="description"></p>
  <!-- All children hidden until parent initializes -->
</div>
```

### On Body (Full Page)

```html
<body ss-cloak>
  <!-- Entire page hidden until all components initialize -->
</body>
```

## Loading Indicators

Combine with a loading overlay:

```html
<style>
  [ss-cloak] { display: none !important; }
  .loading { display: block; }
  .app:not([ss-cloak]) + .loading { display: none; }
</style>

<div class="app" ss-cloak ss-data="{ ready: true }">
  <!-- Your app content -->
</div>

<div class="loading">
  <p>Loading...</p>
</div>
```

Once the app initializes:
1. `ss-cloak` is removed from `.app`
2. `.app` becomes visible
3. `.loading` is hidden via CSS sibling selector

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-cloak Example</title>
  <style>
    [ss-cloak] { display: none !important; }
    
    .card {
      border: 1px solid #ddd;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <!-- This prevents flash of unrendered expressions -->
  <div ss-cloak ss-data="{ 
    user: { name: 'John Doe', role: 'Admin' },
    stats: { posts: 42, followers: 1234 }
  }">
    <div class="card">
      <h2 ss-text="user.name">Loading user...</h2>
      <p ss-text="'Role: ' + user.role">Loading role...</p>
    </div>
    
    <div class="card">
      <p ss-text="stats.posts + ' posts'">-- posts</p>
      <p ss-text="stats.followers.toLocaleString() + ' followers'">-- followers</p>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use on dynamic content** - Static content doesn't need cloaking
2. **Place strategically** - Cloak containers rather than every element
3. **Add early CSS** - Include the `[ss-cloak]` rule in `<head>` for earliest hiding
4. **Consider loading states** - Show spinners for long-loading content

## How It Works

1. Page loads with `ss-cloak` elements hidden by CSS
2. SenangStart initializes and processes directives
3. `ss-cloak` attribute is removed after processing
4. Element becomes visible with rendered content

## Related Directives

- [ss-data](/directives/ss-data) - Define component data
- [ss-text](/directives/ss-text) - Bind text content
- [ss-show](/directives/ss-show) - Toggle visibility
