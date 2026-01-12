# ss-ref

The `ss-ref` directive assigns a reference to an element that can be accessed programmatically via `$refs`.

## Syntax

```html
<element ss-ref="referenceName"></element>
```

Access via:
```html
<element ss-on:click="$refs.referenceName.someMethod()"></element>
```

## Basic Usage

### Focus an Input

```html
<div ss-data="{}">
  <input type="text" ss-ref="nameInput" placeholder="Enter name">
  <button ss-on:click="$refs.nameInput.focus()">Focus Input</button>
</div>
```

### Get/Set Values

```html
<div ss-data="{ savedValue: '' }">
  <input type="text" ss-ref="myInput">
  <button ss-on:click="savedValue = $refs.myInput.value">Save</button>
  <button ss-on:click="$refs.myInput.value = ''">Clear</button>
  <p ss-text="'Saved: ' + savedValue"></p>
</div>
```

## Common Use Cases

### Form Management

```html
<div ss-data="{ }">
  <form ss-ref="myForm">
    <input name="email" type="email" required>
    <input name="password" type="password" required>
    <button type="submit">Submit</button>
  </form>
  
  <button ss-on:click="$refs.myForm.reset()">Reset Form</button>
  <button ss-on:click="console.log($refs.myForm.checkValidity())">
    Check Validity
  </button>
</div>
```

### Media Control

```html
<div ss-data="{ isPlaying: false }">
  <video ss-ref="video" src="video.mp4" width="400"></video>
  
  <button ss-on:click="$refs.video.play(); isPlaying = true">Play</button>
  <button ss-on:click="$refs.video.pause(); isPlaying = false">Pause</button>
  <button ss-on:click="$refs.video.currentTime = 0">Restart</button>
</div>
```

### Canvas Drawing

```html
<div ss-data="{ 
  draw() {
    const ctx = $refs.canvas.getContext('2d')
    ctx.fillStyle = 'blue'
    ctx.fillRect(10, 10, 100, 100)
  }
}">
  <canvas ss-ref="canvas" width="400" height="300"></canvas>
  <button ss-on:click="draw()">Draw Rectangle</button>
</div>
```

### Scroll to Element

```html
<div ss-data="{}">
  <button ss-on:click="$refs.section.scrollIntoView({ behavior: 'smooth' })">
    Scroll to Section
  </button>
  
  <div style="height: 1000px;">Scroll down...</div>
  
  <div ss-ref="section">
    <h2>Target Section</h2>
    <p>You scrolled here!</p>
  </div>
</div>
```

### Dialog/Modal

```html
<div ss-data="{}">
  <button ss-on:click="$refs.dialog.showModal()">Open Dialog</button>
  
  <dialog ss-ref="dialog">
    <h2>Dialog Title</h2>
    <p>This is a native dialog.</p>
    <button ss-on:click="$refs.dialog.close()">Close</button>
  </dialog>
</div>
```

## Multiple Refs

```html
<div ss-data="{ activeInput: 0 }">
  <input ss-ref="input1" placeholder="First">
  <input ss-ref="input2" placeholder="Second">
  <input ss-ref="input3" placeholder="Third">
  
  <button ss-on:click="$refs.input1.focus()">Focus 1</button>
  <button ss-on:click="$refs.input2.focus()">Focus 2</button>
  <button ss-on:click="$refs.input3.focus()">Focus 3</button>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-ref Example</title>
  <style>
    .tabs { display: flex; gap: 0.5rem; }
    .tab { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; }
    .tab.active { background: #007bff; color: white; border-color: #007bff; }
    .panel { padding: 1rem; border: 1px solid #ddd; margin-top: -1px; }
  </style>
</head>
<body>
  <div ss-data="{ 
    activeTab: 0,
    selectTab(index) {
      this.activeTab = index
      // Scroll tab into view if needed
      const tabs = ['tab0', 'tab1', 'tab2']
      $refs[tabs[index]].scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
  }">
    <div class="tabs">
      <div ss-ref="tab0" class="tab" ss-bind:class="activeTab === 0 ? 'active' : ''" 
           ss-on:click="selectTab(0)">Tab 1</div>
      <div ss-ref="tab1" class="tab" ss-bind:class="activeTab === 1 ? 'active' : ''" 
           ss-on:click="selectTab(1)">Tab 2</div>
      <div ss-ref="tab2" class="tab" ss-bind:class="activeTab === 2 ? 'active' : ''" 
           ss-on:click="selectTab(2)">Tab 3</div>
    </div>
    
    <div class="panel">
      <template ss-if="activeTab === 0">
        <h3>Panel 1</h3>
        <p>Content for tab 1</p>
      </template>
      <template ss-if="activeTab === 1">
        <h3>Panel 2</h3>
        <p>Content for tab 2</p>
      </template>
      <template ss-if="activeTab === 2">
        <h3>Panel 3</h3>
        <p>Content for tab 3</p>
      </template>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use meaningful names** - `ss-ref="emailInput"` not `ss-ref="input1"`
2. **Avoid excessive DOM manipulation** - Prefer reactive data when possible
3. **Check existence** - Refs may not exist if conditionally rendered
4. **Keep refs in same scope** - Refs are scoped to the `ss-data` context

## Related Directives

- [ss-on](/directives/ss-on) - Use refs in event handlers
- [ss-data](/directives/ss-data) - Define methods that use refs
- [Magic Properties](/directives/magic-properties) - `$refs` object
