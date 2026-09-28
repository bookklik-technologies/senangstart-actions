# ss-on

The `ss-on` directive attaches event listeners to elements. It supports all DOM events with optional modifiers for common patterns.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-on.min.js"></script>
```

## Syntax

```html
<element ss-on:event="expression"></element>
<element ss-on:event.modifier="expression"></element>
```

## Basic Events

### Click

```html
<div ss-data="{ count: 0 }">
  <button ss-on:click="count++">Clicked <span ss-text="count"></span> times</button>
</div>
```

### Double Click

```html
<div ss-data="{ message: 'Double-click me' }">
  <div ss-on:dblclick="message = 'Double-clicked!'" ss-text="message"></div>
</div>
```

### Mouse Events

```html
<div ss-data="{ isHovering: false }">
  <div ss-on:mouseenter="isHovering = true"
       ss-on:mouseleave="isHovering = false"
       ss-bind:class="isHovering ? 'highlighted' : ''">
    Hover over me
  </div>
</div>
```

## Keyboard Events

### Keyup/Keydown

```html
<div ss-data="{ lastKey: '' }">
  <input ss-on:keyup="lastKey = $event.key" placeholder="Press any key">
  <p ss-text="'Last key: ' + lastKey"></p>
</div>
```

### Key Modifiers

```html
<div ss-data="{ value: '' }">
  <!-- Trigger only on Enter -->
  <input ss-model="value" ss-on:keyup.enter="alert('Submitted: ' + value)">
  
  <!-- Trigger only on Escape -->
  <input ss-on:keydown.escape="value = ''">
  
  <!-- Trigger on Ctrl+Enter -->
  <input ss-on:keydown.ctrl.enter="save(value)">
</div>
```

Any kebab-cased `KeyboardEvent.key` name works as a modifier, for example `.arrow-up`, `.page-down`, `.a`, `.`.

## Form Events

### Submit

```html
<div ss-data="{ email: '' }">
  <form ss-on:submit.prevent="console.log('Submitting:', email)">
    <input type="email" ss-model="email" required>
    <button type="submit">Submit</button>
  </form>
</div>
```

### Input

```html
<div ss-data="{ text: '', charCount: 0 }">
  <textarea ss-model="text" 
            ss-on:input="charCount = text.length">
  </textarea>
  <p ss-text="charCount + ' characters'"></p>
</div>
```

### Change

```html
<div ss-data="{ selected: '' }">
  <select ss-model="selected" ss-on:change="console.log('Changed to:', selected)">
    <option value="">Select...</option>
    <option value="a">Option A</option>
    <option value="b">Option B</option>
  </select>
</div>
```

### Focus/Blur

```html
<div ss-data="{ isFocused: false }">
  <input ss-on:focus="isFocused = true"
         ss-on:blur="isFocused = false"
         ss-bind:class="isFocused ? 'focused' : ''">
</div>
```

## Event Modifiers

### .prevent

Calls `event.preventDefault()`:

```html
<a href="/somewhere" ss-on:click.prevent="handleClick()">
  Won't navigate
</a>

<form ss-on:submit.prevent="submitForm()">
  Won't reload page
</form>
```

### .stop

Calls `event.stopPropagation()`:

```html
<div ss-on:click="console.log('outer')">
  <button ss-on:click.stop="console.log('inner')">
    Won't trigger outer click
  </button>
</div>
```

### .self

Only trigger if event target is the element itself:

```html
<div ss-on:click.self="closeModal()" class="modal-backdrop">
  <div class="modal">
    Clicking here won't close
  </div>
</div>
```

### .once

Only trigger once. The listener is removed from its actual target (element, window, or document):

```html
<button ss-on:click.once="initializeApp()">
  Initialize (only works once)
</button>
```

### .outside / .away

Only trigger when the event happens outside the element (listener is attached to `document`). Does not fire when the click is inside the element, when the target is detached, or when the element is hidden:

```html
<div ss-on:click.outside="closeModal()" class="modal">
  Clicking outside closes the modal
</div>
```

### .window and .document

Attach the listener to `window` or `document` instead of the element:

```html
<div ss-data="{ key: '' }">
  <div ss-on:keydown.window.slash="openSearch()">
  <div ss-on:resize.window="recalculate()">
  <div ss-on:custom-event.document="handle()">
</div>
```

### .capture and .passive

Pass listener options to `addEventListener`:

```html
<!-- Capture phase listener -->
<div ss-on:click.capture="handleCapture()">

<!-- Passive listener (cannot call preventDefault) -->
<div ss-on:scroll.passive="onScroll()">

<!-- Explicitly non-passive -->
<div ss-on:touchstart.passive.false="onTouch()">
```

### .debounce and .throttle

Debounce or throttle the handler. Default is `250ms`; customize with a duration modifier:

```html
<input ss-on:input.debounce="search(query)">
<input ss-on:input.debounce.500ms="search(query)">
<div ss-on:scroll.throttle="onScroll()">
<div ss-on:scroll.throttle.750ms="onScroll()">
```

### .camel and .dot

Transform the event name (useful for custom events):

```html
<!-- Listens for "customEvent" -->
<div ss-on:custom-event.camel="handler()">

<!-- Listens for "custom.event" -->
<div ss-on:custom-event.dot="handler()">
```

## System Modifiers

Macros for `KeyboardEvent.key` and mouse events. When used on click-like events they map to the pressed modifier keys; on keyboard events they must be combined with a key:

- `.ctrl`, `.shift`, `.alt`, `.meta` — plain system keys
- `.cmd`, `.super` — aliases for `.meta`
- `.esc` — Escape
- `.space` / `.spacebar` — Space
- `.slash` — `/`
- `.period` — `.`
- `.comma` — `,`
- `.equal` — `=`
- `.minus` — `-`
- `.underscore` — `_`
- `.up`, `.down`, `.left`, `.right` — Arrow keys

Combine them: `ss-on:keydown.ctrl.slash="toggleHelp()"` or `ss-on:click.shift="..."`
## Accessing the Event Object

Use `$event` to access the native event:

```html
<div ss-data="{}">
  <input ss-on:input="console.log($event.target.value)">
  <div ss-on:click="console.log('Clicked at:', $event.clientX, $event.clientY)">
    Click anywhere
  </div>
</div>
```

## Calling Methods

### With arguments

```html
<div ss-data="{ 
  items: [],
  addItem(name) {
    this.items.push(name)
  },
  removeItem(index) {
    this.items.splice(index, 1)
  }
}">
  <button ss-on:click="addItem('New Item')">Add</button>
  
  <template ss-for="(item, i) in items">
    <div>
      <span ss-text="item"></span>
      <button ss-on:click="removeItem(i)">Remove</button>
    </div>
  </template>
</div>
```

### Bare method references

If the expression is only a method name, it is invoked with the event as its argument:

```html
<div ss-data="{ handleClick(e) { console.log(e.type) } }">
  <!-- handleClick receives the click event automatically -->
  <button ss-on:click="handleClick">Click</button>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-on Example</title>
  <style>
    .canvas { 
      width: 300px; 
      height: 200px; 
      border: 1px solid #ddd; 
      position: relative;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: red;
      border-radius: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
    }
  </style>
</head>
<body>
  <div ss-data="{ 
    clicks: [],
    addClick(e) {
      const rect = e.target.getBoundingClientRect()
      this.clicks.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    },
    clear() {
      this.clicks = []
    }
  }">
    <h2>Click Canvas</h2>
    
    <div class="canvas" ss-on:click="addClick($event)">
      <template ss-for="click in clicks">
        <div class="dot" ss-bind:style="'left:' + click.x + 'px; top:' + click.y + 'px'"></div>
      </template>
    </div>
    
    <p ss-text="clicks.length + ' clicks'"></p>
    <button ss-on:click="clear()">Clear</button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use modifiers** - `.prevent` and `.stop` are cleaner than manual calls
2. **Keep handlers simple** - Complex logic should be in methods
3. **Use `.self` for overlays** - Prevent accidental closes
4. **Debounce expensive operations** - For input events with API calls
5. **Use `.outside` for dropdowns** - Close menus when clicking away

## Modifier Reference

| Modifier | Behavior |
|---|---|
| `.prevent` | Calls `event.preventDefault()` |
| `.stop` | Calls `event.stopPropagation()` |
| `.self` | Only fires when `event.target` is the element itself |
| `.once` | Removes the listener after the first invocation |
| `.outside` / `.away` | Fires only when the event originates outside the element (attaches to `document`) |
| `.window` | Attaches the listener to `window` |
| `.document` | Attaches the listener to `document` |
| `.capture` | Uses capture phase (`{ capture: true }`) |
| `.passive` | Uses `{ passive: true }` (or `false` with `.passive.false`) |
| `.debounce` / `.debounce.250ms` | Debounces the handler (default `250ms`) |
| `.throttle` / `.throttle.250ms` | Throttles the handler (default `250ms`) |
| `.camel` | Converts `custom-event` to `customEvent` |
| `.dot` | Converts `custom-event` to `custom.event` |
| Key names / aliases | Filters keyboard events by key (see System Modifiers) |

## Related Directives

- [ss-model](/directives/ss-model) - Two-way binding (uses input events internally)
- [ss-data](/directives/ss-data) - Define event handler methods
- [Magic Properties](/directives/magic-properties) - `$event`, `$dispatch`
