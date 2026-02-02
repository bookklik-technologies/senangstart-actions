# ss-model

The `ss-model` directive creates two-way data binding between form elements and data properties. When the input changes, the data updates. When the data updates, the input reflects the change.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-model.min.js"></script>
```

## Syntax

```html
<input ss-model="property">
```

## Supported Elements

### Text Input

```html
<div ss-data="{ name: '' }">
  <input type="text" ss-model="name" placeholder="Enter name">
  <p ss-text="'Hello, ' + (name || 'stranger')"></p>
</div>
```

### Textarea

```html
<div ss-data="{ message: '' }">
  <textarea ss-model="message" placeholder="Enter message"></textarea>
  <p ss-text="message.length + ' characters'"></p>
</div>
```

### Number Input

```html
<div ss-data="{ quantity: 1 }">
  <input type="number" ss-model="quantity" min="1" max="10">
  <p ss-text="'Total: $' + (quantity * 9.99).toFixed(2)"></p>
</div>
```

### Checkbox (Boolean)

```html
<div ss-data="{ agreed: false }">
  <label>
    <input type="checkbox" ss-model="agreed">
    I agree to the terms
  </label>
  <button ss-bind:disabled="!agreed">Continue</button>
</div>
```

### Radio Buttons

```html
<div ss-data="{ color: 'red' }">
  <label>
    <input type="radio" ss-model="color" value="red"> Red
  </label>
  <label>
    <input type="radio" ss-model="color" value="green"> Green
  </label>
  <label>
    <input type="radio" ss-model="color" value="blue"> Blue
  </label>
  <p ss-text="'Selected: ' + color"></p>
</div>
```

### Select Dropdown

```html
<div ss-data="{ country: '' }">
  <select ss-model="country">
    <option value="">Choose a country</option>
    <option value="my">Malaysia</option>
    <option value="sg">Singapore</option>
    <option value="id">Indonesia</option>
  </select>
  <p ss-show="country" ss-text="'Selected: ' + country"></p>
</div>
```

### Select Multiple

```html
<div ss-data="{ selected: [] }">
  <select ss-model="selected" multiple>
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
  </select>
  <p ss-text="'Selected: ' + selected.join(', ')"></p>
</div>
```

## Real-time Validation

```html
<div ss-data="{ 
  email: '',
  isValid: false,
  validate() {
    this.isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
  }
}">
  <input type="email" 
         ss-model="email" 
         ss-on:input="validate()"
         placeholder="Enter email">
  
  <p ss-show="email && !isValid" style="color: red">
    Please enter a valid email
  </p>
  <p ss-show="isValid" style="color: green">
    ✓ Valid email
  </p>
</div>
```

## Form Example

```html
<div ss-data="{ 
  form: {
    name: '',
    email: '',
    plan: 'basic',
    newsletter: true
  },
  submitted: false,
  submit() {
    console.log('Submitting:', this.form)
    this.submitted = true
  }
}">
  <template ss-if="!submitted">
    <form ss-on:submit.prevent="submit()">
      <div>
        <label>Name</label>
        <input type="text" ss-model="form.name" required>
      </div>
      
      <div>
        <label>Email</label>
        <input type="email" ss-model="form.email" required>
      </div>
      
      <div>
        <label>Plan</label>
        <select ss-model="form.plan">
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      
      <div>
        <label>
          <input type="checkbox" ss-model="form.newsletter">
          Subscribe to newsletter
        </label>
      </div>
      
      <button type="submit">Submit</button>
    </form>
  </template>
  
  <template ss-if="submitted">
    <div>
      <h3>Thank you, <span ss-text="form.name"></span>!</h3>
      <p>We'll contact you at <span ss-text="form.email"></span></p>
    </div>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-model Example</title>
  <style>
    .calculator { max-width: 300px; }
    .result { font-size: 2rem; font-weight: bold; margin: 1rem 0; }
    input, select { width: 100%; padding: 0.5rem; margin: 0.25rem 0; }
  </style>
</head>
<body>
  <div ss-data="{ 
    amount: 100,
    rate: 5,
    years: 1,
    get interest() { return this.amount * (this.rate / 100) * this.years },
    get total() { return this.amount + this.interest }
  }" class="calculator">
    <h2>Interest Calculator</h2>
    
    <label>
      Principal Amount ($)
      <input type="number" ss-model="amount" min="0">
    </label>
    
    <label>
      Interest Rate (%)
      <input type="number" ss-model="rate" min="0" max="100" step="0.1">
    </label>
    
    <label>
      Time (years)
      <input type="number" ss-model="years" min="1">
    </label>
    
    <div class="result">
      <p>Interest: $<span ss-text="interest.toFixed(2)"></span></p>
      <p>Total: $<span ss-text="total.toFixed(2)"></span></p>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Initialize all bound properties** - Declare with default values in `ss-data`
2. **Use appropriate input types** - `type="number"` for numbers, `type="email"` for emails
3. **Add validation** - Use `ss-on:input` or `ss-on:blur` for validation
4. **Consider debouncing** - For expensive operations triggered by input

## Related Directives

- [ss-data](/directives/ss-data) - Define form data
- [ss-on](/directives/ss-on) - Handle form events
- [ss-bind](/directives/ss-bind) - Bind validation states to classes
