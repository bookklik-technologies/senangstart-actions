# $dispatch

Dispatch custom DOM events that bubble up the element tree.

## Syntax

```javascript
$dispatch(eventName)
$dispatch(eventName, detail)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `eventName` | string | Name of the custom event |
| `detail` | any | Optional data to pass with the event |

## How It Works

1. Call `$dispatch('eventName', data)` on a child element
2. Listen with `ss-on:eventName` on a parent element
3. Access data via `$event.detail`

```html
<div ss-on:my-event="console.log($event.detail)">
  <button ss-on:click="$dispatch('my-event', { message: 'Hello!' })">
    Send Event
  </button>
</div>
```

## Basic Usage

### Simple Event

```html
<div ss-data="{ received: false }" ss-on:ping="received = true">
  <p ss-text="received ? 'Received!' : 'Waiting...'"></p>
  <button ss-on:click="$dispatch('ping')">Send Ping</button>
</div>
```

### With Data

```html
<div ss-data="{ message: '' }" ss-on:notify="message = $event.detail.text">
  <p ss-text="message || 'No message'"></p>
  
  <button ss-on:click="$dispatch('notify', { text: 'Hello from Button 1' })">
    Button 1
  </button>
  <button ss-on:click="$dispatch('notify', { text: 'Hello from Button 2' })">
    Button 2
  </button>
</div>
```

## Use Cases

### Child-to-Parent Communication

```html
<!-- Parent component -->
<div ss-data="{ items: [] }" ss-on:add-item="items.push($event.detail)">
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
        $dispatch('add-item', { name: newItem });
        newItem = ''
      }
    ">Add</button>
  </div>
</div>
```

### Modal Close

```html
<div ss-data="{ showModal: false }" ss-on:close-modal="showModal = false">
  <button ss-on:click="showModal = true">Open Modal</button>
  
  <template ss-if="showModal">
    <div class="modal-backdrop" ss-on:click.self="$dispatch('close-modal')">
      <!-- Separate scope for modal -->
      <div class="modal" ss-data="{}">
        <h2>Modal Title</h2>
        <p>Modal content</p>
        <button ss-on:click="$dispatch('close-modal')">Close</button>
      </div>
    </div>
  </template>
</div>
```

### Form Validation Events

```html
<div ss-data="{ errors: [] }" 
     ss-on:validation-error="errors.push($event.detail.message)"
     ss-on:form-valid="errors = []; submitForm()">
  
  <template ss-for="error in errors">
    <p style="color: red;" ss-text="error"></p>
  </template>
  
  <div ss-data="{ email: '' }">
    <input ss-model="email" type="email" placeholder="Email">
    <button ss-on:click="
      if (!email.includes('@')) {
        $dispatch('validation-error', { message: 'Invalid email' })
      } else {
        $dispatch('form-valid')
      }
    ">Submit</button>
  </div>
</div>
```

### Wizard Steps

```html
<div ss-data="{ currentStep: 1 }" 
     ss-on:next-step="currentStep++"
     ss-on:prev-step="currentStep--"
     ss-on:goto-step="currentStep = $event.detail.step">
  
  <p ss-text="'Step ' + currentStep + ' of 3'"></p>
  
  <!-- Step 1 -->
  <template ss-if="currentStep === 1">
    <div ss-data="{}">
      <h3>Step 1: Personal Info</h3>
      <button ss-on:click="$dispatch('next-step')">Next</button>
    </div>
  </template>
  
  <!-- Step 2 -->
  <template ss-if="currentStep === 2">
    <div ss-data="{}">
      <h3>Step 2: Address</h3>
      <button ss-on:click="$dispatch('prev-step')">Back</button>
      <button ss-on:click="$dispatch('next-step')">Next</button>
    </div>
  </template>
  
  <!-- Step 3 -->
  <template ss-if="currentStep === 3">
    <div ss-data="{}">
      <h3>Step 3: Confirm</h3>
      <button ss-on:click="$dispatch('prev-step')">Back</button>
      <button ss-on:click="$dispatch('goto-step', { step: 1 })">Start Over</button>
    </div>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>$dispatch Example</title>
  <style>
    .log { background: #f5f5f5; padding: 1rem; font-family: monospace; }
  </style>
</head>
<body>
  <div ss-data="{ 
    events: [],
    log(name, data) {
      this.events.unshift({ time: new Date().toLocaleTimeString(), name, data })
      if (this.events.length > 5) this.events.pop()
    }
  }" ss-on:button-click="log('button-click', $event.detail)"
     ss-on:input-change="log('input-change', $event.detail)">
    
    <h2>Event Logger</h2>
    
    <!-- Buttons that dispatch events -->
    <div ss-data="{}">
      <button ss-on:click="$dispatch('button-click', { button: 'A' })">Button A</button>
      <button ss-on:click="$dispatch('button-click', { button: 'B' })">Button B</button>
    </div>
    
    <!-- Input that dispatches on change -->
    <div ss-data="{ value: '' }">
      <input ss-model="value" 
             ss-on:input="$dispatch('input-change', { value: value })"
             placeholder="Type something...">
    </div>
    
    <!-- Event log display -->
    <div class="log">
      <template ss-for="e in events">
        <div ss-text="e.time + ' - ' + e.name + ': ' + JSON.stringify(e.data)"></div>
      </template>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use descriptive names** - `add-item` not `event1`
2. **Namespace events** - `cart:add`, `modal:close`
3. **Keep data minimal** - Pass only what's needed
4. **Document events** - List events each component emits

## Related

- [ss-on directive](/directives/ss-on) - Listening to events
- [$event property](/properties/event) - Accessing event details
- [$store property](/properties/store) - Alternative for global state
