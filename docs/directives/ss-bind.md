# ss-bind

The `ss-bind` directive dynamically binds HTML attributes to expressions. Use it to set classes, styles, disabled states, and any other attribute based on your data.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-bind.min.js"></script>
```

## Syntax

```html
<element ss-bind:attribute="expression"></element>
```

## Common Bindings

### Class Binding

```html
<div ss-data="{ isActive: false, hasError: false }">
  <!-- Single class -->
  <div ss-bind:class="isActive ? 'active' : ''">Toggle me</div>
  
  <!-- Multiple classes -->
  <div ss-bind:class="(isActive ? 'active ' : '') + (hasError ? 'error' : '')">
    Multiple states
  </div>
  
  <button ss-on:click="isActive = !isActive">Toggle Active</button>
  <button ss-on:click="hasError = !hasError">Toggle Error</button>
</div>
```

### Style Binding

```html
<div ss-data="{ color: 'blue', size: 16 }">
  <p ss-bind:style="'color: ' + color + '; font-size: ' + size + 'px'">
    Styled text
  </p>
  
  <input type="color" ss-model="color">
  <input type="range" ss-model="size" min="12" max="48">
</div>
```

### Disabled State

```html
<div ss-data="{ isLoading: false, formValid: false }">
  <button ss-bind:disabled="isLoading" 
          ss-on:click="isLoading = true">
    <span ss-text="isLoading ? 'Loading...' : 'Submit'"></span>
  </button>
  
  <button ss-bind:disabled="!formValid">
    Continue
  </button>
</div>
```

### Href and Src

```html
<div ss-data="{ 
  userId: 123,
  imageUrl: 'https://example.com/avatar.jpg'
}">
  <a ss-bind:href="'/users/' + userId">View Profile</a>
  <img ss-bind:src="imageUrl" ss-bind:alt="'User ' + userId">
</div>
```

### Data Attributes

```html
<div ss-data="{ itemId: 42, category: 'electronics' }">
  <div ss-bind:data-id="itemId" 
       ss-bind:data-category="category">
    Product Item
  </div>
</div>
```

## Multiple Bindings

You can use multiple `ss-bind` on the same element:

```html
<div ss-data="{ 
  theme: 'dark',
  isDisabled: false,
  tooltip: 'Click me'
}">
  <button ss-bind:class="'btn-' + theme"
          ss-bind:disabled="isDisabled"
          ss-bind:title="tooltip">
    Action
  </button>
</div>
```

## Boolean Attributes

For boolean attributes like `disabled`, `checked`, `readonly`, the attribute is added when truthy and removed when falsy:

```html
<div ss-data="{ isChecked: true, isReadonly: false }">
  <input type="checkbox" ss-bind:checked="isChecked">
  <input type="text" ss-bind:readonly="isReadonly">
  <button ss-bind:disabled="!isChecked">Proceed</button>
</div>
```

## Dynamic Classes Pattern

### Object-like Class Binding

```html
<div ss-data="{ 
  size: 'large',
  variant: 'primary',
  isRounded: true
}">
  <button ss-bind:class="
    'btn ' + 
    'btn-' + size + ' ' + 
    'btn-' + variant + ' ' + 
    (isRounded ? 'rounded' : '')
  ">
    Styled Button
  </button>
</div>
```

### Status Classes

```html
<div ss-data="{ status: 'pending' }">
  <span ss-bind:class="
    status === 'success' ? 'text-green' :
    status === 'error' ? 'text-red' :
    status === 'pending' ? 'text-yellow' : 'text-gray'
  " ss-text="status">
  </span>
  
  <select ss-model="status">
    <option value="pending">Pending</option>
    <option value="success">Success</option>
    <option value="error">Error</option>
  </select>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-bind Example</title>
  <style>
    .card { padding: 1rem; border: 1px solid #ddd; margin: 1rem 0; }
    .card-primary { border-color: #007bff; background: #e7f1ff; }
    .card-success { border-color: #28a745; background: #e8f5e9; }
    .card-danger { border-color: #dc3545; background: #ffebee; }
    .shadow { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .rounded { border-radius: 8px; }
  </style>
</head>
<body>
  <div ss-data="{ 
    variant: 'primary',
    hasShadow: true,
    isRounded: true,
    customPadding: 16
  }">
    <h2>Card Customizer</h2>
    
    <div ss-bind:class="
      'card ' + 
      'card-' + variant + ' ' + 
      (hasShadow ? 'shadow ' : '') + 
      (isRounded ? 'rounded' : '')
    " ss-bind:style="'padding: ' + customPadding + 'px'">
      <h3>Preview Card</h3>
      <p>This card updates based on your selections.</p>
    </div>
    
    <div style="margin-top: 1rem;">
      <label>
        Variant:
        <select ss-model="variant">
          <option value="primary">Primary</option>
          <option value="success">Success</option>
          <option value="danger">Danger</option>
        </select>
      </label>
      
      <label>
        <input type="checkbox" ss-model="hasShadow"> Shadow
      </label>
      
      <label>
        <input type="checkbox" ss-model="isRounded"> Rounded
      </label>
      
      <label>
        Padding: <span ss-text="customPadding + 'px'"></span>
        <input type="range" ss-model="customPadding" min="8" max="32">
      </label>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Keep expressions readable** - Break complex class logic into methods
2. **Use consistent naming** - Follow BEM or similar conventions
3. **Combine with ss-text/ss-show** - Different directives for different purposes
4. **Boolean attributes** - Just use the condition, not string conversion

## Related Directives

- [ss-text](/directives/ss-text) - Bind text content
- [ss-show](/directives/ss-show) - Toggle visibility
- [ss-data](/directives/ss-data) - Provide binding data
