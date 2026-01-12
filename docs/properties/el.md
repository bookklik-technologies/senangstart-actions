# $el

Reference to the current DOM element where the expression is evaluated.

## Syntax

```javascript
$el
$el.property
$el.method()
```

## How It Works

In any `ss-*` expression, `$el` refers to the element that has the attribute:

```html
<div ss-on:click="console.log($el)">
  <!-- $el is this div -->
</div>
```

## Common Use Cases

### Toggle Classes

```html
<div ss-on:click="$el.classList.toggle('active')">
  Click to toggle active class
</div>

<div ss-on:click="$el.classList.add('clicked')">
  Add clicked class
</div>

<div ss-on:click="$el.classList.remove('highlight')">
  Remove highlight class
</div>
```

### Inline Style Changes

```html
<div ss-on:mouseenter="$el.style.backgroundColor = 'yellow'"
     ss-on:mouseleave="$el.style.backgroundColor = ''">
  Hover to highlight
</div>

<div ss-on:click="$el.style.opacity = '0.5'">
  Click to fade
</div>
```

### Get Element Properties

```html
<div ss-data="{ info: '' }">
  <div ss-on:click="info = 'Width: ' + $el.offsetWidth + ', Height: ' + $el.offsetHeight"
       style="width: 200px; height: 100px; background: #eee;">
    Click to get dimensions
  </div>
  <p ss-text="info"></p>
</div>
```

### Self-Remove

```html
<div ss-on:click="$el.remove()">
  Click to remove this element
</div>
```

### Focus Self

```html
<input ss-on:mouseenter="$el.focus()" placeholder="Auto-focus on hover">
```

### Data Attributes

```html
<div ss-data="{ selected: '' }">
  <button data-value="option1" ss-on:click="selected = $el.dataset.value">Option 1</button>
  <button data-value="option2" ss-on:click="selected = $el.dataset.value">Option 2</button>
  <button data-value="option3" ss-on:click="selected = $el.dataset.value">Option 3</button>
  <p ss-text="'Selected: ' + selected"></p>
</div>
```

### Parent Navigation

```html
<div class="card">
  <button ss-on:click="$el.closest('.card').classList.toggle('expanded')">
    Toggle Card
  </button>
</div>
```

### Sibling Access

```html
<div>
  <span>Hello</span>
  <button ss-on:click="$el.previousElementSibling.style.color = 'red'">
    Color Previous
  </button>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>$el Example</title>
  <style>
    .box {
      width: 100px;
      height: 100px;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .box.large { transform: scale(1.5); }
    .box.rotated { transform: rotate(45deg); }
  </style>
</head>
<body>
  <div ss-data="{}">
    <div class="box" 
         ss-on:click="$el.classList.toggle('large')"
         ss-on:dblclick="$el.classList.toggle('rotated')">
      Click me
    </div>
    <p>Click to enlarge, double-click to rotate</p>
  </div>

  <hr>

  <div ss-data="{ colors: ['red', 'green', 'blue', 'purple', 'orange'] }">
    <h3>Color Picker</h3>
    <template ss-for="color in colors">
      <button ss-bind:style="'background: ' + color + '; color: white; margin: 2px;'"
              ss-bind:data-color="color"
              ss-on:click="$el.parentElement.style.backgroundColor = $el.dataset.color">
        <span ss-text="color"></span>
      </button>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## $el vs $refs

| `$el` | `$refs` |
|-------|---------|
| Current element | Any referenced element |
| Implicit | Explicit with `ss-ref` |
| Always available | Needs setup |

```html
<!-- $el = this button -->
<button ss-on:click="$el.disabled = true">Disable Self</button>

<!-- $refs.other = the input -->
<input ss-ref="other">
<button ss-on:click="$refs.other.focus()">Focus Other</button>
```

## Best Practices

1. **Use for quick DOM access** - Class toggles, style changes
2. **Prefer reactive data** - For state that affects multiple elements
3. **Use for self-references** - When you need the element itself
4. **Combine with closest()** - To access parent containers

## Related

- [$refs property](/properties/refs) - Named element references
- [$event property](/properties/event) - Event object access
