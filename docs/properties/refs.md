# $refs

Access DOM elements that have been marked with the `ss-ref` directive.

## Syntax

```javascript
$refs.referenceName
```

## How It Works

1. Mark an element with `ss-ref="name"`
2. Access it via `$refs.name` in expressions

```html
<div ss-data="{}">
  <input ss-ref="emailInput" type="email">
  <button ss-on:click="$refs.emailInput.focus()">Focus Email</button>
</div>
```

## Common Use Cases

### Focus Management

```html
<div ss-data="{}">
  <input ss-ref="username" placeholder="Username" 
         ss-on:keyup.enter="$refs.password.focus()">
  <input ss-ref="password" type="password" placeholder="Password"
         ss-on:keyup.enter="$refs.submit.click()">
  <button ss-ref="submit">Login</button>
</div>
```

### Get Element Values

```html
<div ss-data="{ savedText: '' }">
  <textarea ss-ref="editor"></textarea>
  <button ss-on:click="savedText = $refs.editor.value">Save</button>
  <button ss-on:click="$refs.editor.value = savedText">Restore</button>
</div>
```

### Form Control

```html
<div ss-data="{}">
  <form ss-ref="myForm">
    <input name="email" type="email" required>
    <input name="password" type="password" required>
    <button type="submit">Submit</button>
  </form>
  
  <button ss-on:click="$refs.myForm.reset()">Reset Form</button>
  <button ss-on:click="alert($refs.myForm.checkValidity())">Validate</button>
</div>
```

### Media Control

```html
<div ss-data="{ isPlaying: false }">
  <video ss-ref="player" src="video.mp4" width="400"></video>
  
  <div>
    <button ss-on:click="$refs.player.play(); isPlaying = true">▶ Play</button>
    <button ss-on:click="$refs.player.pause(); isPlaying = false">⏸ Pause</button>
    <button ss-on:click="$refs.player.currentTime = 0">⏮ Restart</button>
    <button ss-on:click="$refs.player.currentTime += 10">⏩ +10s</button>
  </div>
</div>
```

### Scroll Control

```html
<div ss-data="{}">
  <nav>
    <button ss-on:click="$refs.section1.scrollIntoView({ behavior: 'smooth' })">Section 1</button>
    <button ss-on:click="$refs.section2.scrollIntoView({ behavior: 'smooth' })">Section 2</button>
    <button ss-on:click="$refs.section3.scrollIntoView({ behavior: 'smooth' })">Section 3</button>
  </nav>
  
  <section ss-ref="section1"><h2>Section 1</h2>...</section>
  <section ss-ref="section2"><h2>Section 2</h2>...</section>
  <section ss-ref="section3"><h2>Section 3</h2>...</section>
</div>
```

### Canvas Drawing

```html
<div ss-data="{ 
  draw() {
    const ctx = $refs.canvas.getContext('2d')
    ctx.fillStyle = '#007bff'
    ctx.fillRect(10, 10, 100, 100)
  },
  clear() {
    const ctx = $refs.canvas.getContext('2d')
    ctx.clearRect(0, 0, $refs.canvas.width, $refs.canvas.height)
  }
}">
  <canvas ss-ref="canvas" width="400" height="300" style="border: 1px solid #ddd;"></canvas>
  <div>
    <button ss-on:click="draw()">Draw</button>
    <button ss-on:click="clear()">Clear</button>
  </div>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>$refs Example</title>
  <style>
    .highlight { background: yellow; }
  </style>
</head>
<body>
  <div ss-data="{}">
    <h2>Text Highlighter</h2>
    
    <p ss-ref="text">
      This is a sample paragraph. Click the buttons below to manipulate this text.
    </p>
    
    <div>
      <button ss-on:click="$refs.text.classList.toggle('highlight')">
        Toggle Highlight
      </button>
      <button ss-on:click="$refs.text.style.fontSize = '20px'">
        Larger
      </button>
      <button ss-on:click="$refs.text.style.fontSize = '14px'">
        Smaller
      </button>
      <button ss-on:click="$refs.text.style = ''">
        Reset
      </button>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use meaningful names** - `$refs.emailInput` is clearer than `$refs.input1`
2. **Check existence** - Elements inside `ss-if` may not exist
3. **Keep in same scope** - Refs are scoped to the nearest `ss-data`
4. **Prefer reactive data** - Use refs for DOM APIs, not data storage

## Related

- [ss-ref directive](/directives/ss-ref) - How to define references
- [$el property](/properties/el) - Reference to current element
