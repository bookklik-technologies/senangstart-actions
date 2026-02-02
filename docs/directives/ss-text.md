# ss-text

The `ss-text` directive binds the text content of an element to a JavaScript expression. The content updates automatically when the underlying data changes.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-text.min.js"></script>
```

## Syntax

```html
<element ss-text="expression"></element>
```

## Basic Usage

### Simple Property Binding

```html
<div ss-data="{ message: 'Hello, World!' }">
  <p ss-text="message"></p>
</div>
```

**Output:** `Hello, World!`

### With Expressions

You can use any valid JavaScript expression:

```html
<div ss-data="{ count: 5 }">
  <p ss-text="count * 2"></p>        <!-- Output: 10 -->
  <p ss-text="count > 3"></p>        <!-- Output: true -->
  <p ss-text="Math.pow(count, 2)"></p> <!-- Output: 25 -->
</div>
```

### String Concatenation

```html
<div ss-data="{ firstName: 'John', lastName: 'Doe' }">
  <p ss-text="'Welcome, ' + firstName + ' ' + lastName + '!'"></p>
</div>
```

**Output:** `Welcome, John Doe!`

### Template Literals

```html
<div ss-data="{ name: 'Sarah', age: 28 }">
  <p ss-text="`${name} is ${age} years old`"></p>
</div>
```

**Output:** `Sarah is 28 years old`

## Conditional Text

Use ternary operators for conditional text:

```html
<div ss-data="{ isLoggedIn: true, username: 'Admin' }">
  <p ss-text="isLoggedIn ? 'Welcome, ' + username : 'Please log in'"></p>
</div>
```

### Multiple Conditions

```html
<div ss-data="{ score: 75 }">
  <p ss-text="score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Pass' : 'Fail'"></p>
</div>
```

**Output:** `Good`

## Working with Arrays

```html
<div ss-data="{ items: ['Apple', 'Banana', 'Cherry'] }">
  <p ss-text="items.length + ' items'"></p>
  <p ss-text="items.join(', ')"></p>
  <p ss-text="items[0]"></p>
</div>
```

**Output:**
- `3 items`
- `Apple, Banana, Cherry`
- `Apple`

## Working with Objects

```html
<div ss-data="{ user: { name: 'John', email: 'john@example.com' } }">
  <p ss-text="user.name"></p>
  <p ss-text="user.email"></p>
  <p ss-text="JSON.stringify(user)"></p>
</div>
```

## Fallback Content

The element's original content is shown until SenangStart initializes:

```html
<div ss-data="{ message: 'Loaded!' }">
  <p ss-text="message">Loading...</p>
</div>
```

Use `ss-cloak` to hide content until ready:

```html
<p ss-cloak ss-text="message">Loading...</p>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-text Example</title>
  <style>
    .stats { display: flex; gap: 2rem; }
    .stat { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { color: #666; }
  </style>
</head>
<body>
  <div ss-data="{ 
    visitors: 1234,
    sales: 567,
    revenue: 12345.67
  }">
    <div class="stats">
      <div class="stat">
        <div class="stat-value" ss-text="visitors.toLocaleString()"></div>
        <div class="stat-label">Visitors</div>
      </div>
      <div class="stat">
        <div class="stat-value" ss-text="sales"></div>
        <div class="stat-label">Sales</div>
      </div>
      <div class="stat">
        <div class="stat-value" ss-text="'$' + revenue.toFixed(2)"></div>
        <div class="stat-label">Revenue</div>
      </div>
    </div>
    
    <button ss-on:click="visitors += Math.floor(Math.random() * 100)">
      Add Visitors
    </button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Keep expressions simple** - Complex logic should be in methods
2. **Use template literals** for complex string formatting
3. **Provide fallback content** - Show meaningful placeholder text
4. **Format numbers** - Use `toLocaleString()`, `toFixed()` for better display

## Related Directives

- [ss-data](/directives/ss-data) - Define the data source
- [ss-bind](/directives/ss-bind) - Bind to attributes instead of text
- [ss-show](/directives/ss-show) - Conditionally show/hide elements
