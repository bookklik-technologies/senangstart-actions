# $event

Access the native DOM event object in event handlers.

## Syntax

```javascript
$event
$event.property
$event.method()
```

## How It Works

In `ss-on:*` handlers, `$event` contains the native DOM event:

```html
<button ss-on:click="console.log($event)">
  <!-- $event is the MouseEvent -->
</button>
```

## Common Properties

### Mouse Events

```html
<div ss-data="{ x: 0, y: 0 }">
  <div ss-on:mousemove="x = $event.clientX; y = $event.clientY"
       style="height: 200px; background: #eee;">
    Move mouse here
  </div>
  <p ss-text="'Position: ' + x + ', ' + y"></p>
</div>
```

| Property | Description |
|----------|-------------|
| `$event.clientX` | X coordinate relative to viewport |
| `$event.clientY` | Y coordinate relative to viewport |
| `$event.pageX` | X coordinate relative to document |
| `$event.pageY` | Y coordinate relative to document |
| `$event.button` | Which mouse button (0=left, 1=middle, 2=right) |

### Keyboard Events

```html
<div ss-data="{ lastKey: '' }">
  <input ss-on:keydown="lastKey = $event.key"
         placeholder="Press any key">
  <p ss-text="'Last key: ' + lastKey"></p>
</div>
```

| Property | Description |
|----------|-------------|
| `$event.key` | Key value ("Enter", "a", "Escape") |
| `$event.code` | Physical key ("KeyA", "Enter") |
| `$event.shiftKey` | Shift held? |
| `$event.ctrlKey` | Ctrl held? |
| `$event.altKey` | Alt held? |
| `$event.metaKey` | Cmd/Win held? |

### Form Events

```html
<div ss-data="{ value: '' }">
  <input ss-on:input="value = $event.target.value">
  <p ss-text="'Value: ' + value"></p>
</div>
```

| Property | Description |
|----------|-------------|
| `$event.target` | Element that triggered event |
| `$event.target.value` | Input value |
| `$event.target.checked` | Checkbox state |

## Event Methods

### preventDefault()

Stop default browser behavior:

```html
<!-- Prevent form submission reload -->
<form ss-on:submit="$event.preventDefault(); handleSubmit()">
  <button type="submit">Submit</button>
</form>

<!-- Prevent link navigation -->
<a href="/page" ss-on:click="$event.preventDefault(); customNavigate()">
  Custom Link
</a>
```

::: tip
Use the `.prevent` modifier instead: `ss-on:submit.prevent="handleSubmit()"`
:::

### stopPropagation()

Prevent event bubbling:

```html
<div ss-on:click="console.log('outer')">
  <button ss-on:click="$event.stopPropagation(); console.log('inner')">
    Only logs 'inner'
  </button>
</div>
```

::: tip
Use the `.stop` modifier instead: `ss-on:click.stop="console.log('inner')"`
:::

## Use Cases

### Drag and Drop

```html
<div ss-data="{ dragging: false, x: 0, y: 0 }">
  <div ss-on:mousedown="dragging = true"
       ss-on:mouseup="dragging = false"
       ss-on:mousemove="if (dragging) { x = $event.clientX; y = $event.clientY }"
       ss-bind:style="'position: fixed; left: ' + x + 'px; top: ' + y + 'px;'"
       style="width: 50px; height: 50px; background: blue; cursor: move;">
  </div>
</div>
```

### Right-Click Menu

```html
<div ss-data="{ showMenu: false, menuX: 0, menuY: 0 }">
  <div ss-on:contextmenu="
    $event.preventDefault();
    showMenu = true;
    menuX = $event.clientX;
    menuY = $event.clientY
  " style="height: 200px; background: #eee;">
    Right-click for menu
  </div>
  
  <div ss-show="showMenu" 
       ss-bind:style="'position: fixed; left: ' + menuX + 'px; top: ' + menuY + 'px;'"
       style="background: white; border: 1px solid #ddd; padding: 0.5rem;">
    <div ss-on:click="showMenu = false">Option 1</div>
    <div ss-on:click="showMenu = false">Option 2</div>
  </div>
</div>
```

### File Input

```html
<div ss-data="{ fileName: '' }">
  <input type="file" ss-on:change="fileName = $event.target.files[0]?.name || ''">
  <p ss-show="fileName" ss-text="'Selected: ' + fileName"></p>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>$event Example</title>
  <style>
    .tracker {
      height: 200px;
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div ss-data="{ 
    mouse: { x: 0, y: 0 },
    keys: [],
    addKey(key) {
      this.keys.unshift(key)
      if (this.keys.length > 5) this.keys.pop()
    }
  }">
    <div class="tracker" 
         ss-on:mousemove="mouse.x = $event.clientX; mouse.y = $event.clientY">
      <span ss-text="`Mouse: ${mouse.x}, ${mouse.y}`"></span>
    </div>
    
    <input ss-on:keydown="addKey($event.key)" placeholder="Type to log keys">
    
    <p>Recent keys: <span ss-text="keys.join(', ')"></span></p>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Related

- [ss-on directive](/directives/ss-on) - Event handling
- [$el property](/properties/el) - Current element
- [$dispatch property](/properties/dispatch) - Custom events
