# SenangStart.init()

Manually initialize a DOM tree. Useful for dynamically added content that wasn't present when the page first loaded.

## Syntax

```javascript
SenangStart.init(root)
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `root` | Element | `document.body` | Root element to initialize |

## Returns

`SenangStart` - Returns the SenangStart object for method chaining.

## When to Use

SenangStart automatically initializes all `ss-*` attributes when the page loads. However, you need to call `init()` manually when:

1. **Dynamic content** - HTML added after page load via JavaScript
2. **AJAX responses** - Content loaded from server
3. **Template rendering** - HTML generated from templates

## Basic Usage

```javascript
// Create new element with SenangStart directives
const newElement = document.createElement('div')
newElement.innerHTML = `
  <div ss-data="{ count: 0 }">
    <button ss-on:click="count++">+</button>
    <span ss-text="count"></span>
  </div>
`
document.body.appendChild(newElement)

// Initialize the new content
SenangStart.init(newElement)
```

## Use Cases

### AJAX Content

```javascript
async function loadContent() {
  const response = await fetch('/api/content')
  const html = await response.text()
  
  const container = document.getElementById('content')
  container.innerHTML = html
  
  // Initialize any SenangStart directives in the new content
  SenangStart.init(container)
}
```

### Modal Dialog

```javascript
function showModal(content) {
  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.innerHTML = `
    <div ss-data="{ closing: false }">
      <div class="modal-content">
        ${content}
        <button ss-on:click="closing = true; setTimeout(() => this.closest('.modal').remove(), 300)">
          Close
        </button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
  SenangStart.init(modal)
}
```

### Infinite Scroll

```javascript
async function loadMore() {
  const response = await fetch(`/api/items?page=${currentPage}`)
  const html = await response.text()
  
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  const container = document.getElementById('items')
  while (temp.firstChild) {
    container.appendChild(temp.firstChild)
  }
  
  // Initialize only the new items
  SenangStart.init(container)
  currentPage++
}
```

### Template Cloning

```javascript
function addItem() {
  const template = document.getElementById('item-template')
  const clone = template.content.cloneNode(true)
  
  document.getElementById('list').appendChild(clone)
  SenangStart.init(document.getElementById('list').lastElementChild)
}
```

```html
<template id="item-template">
  <div ss-data="{ editing: false, text: 'New Item' }">
    <template ss-if="!editing">
      <span ss-text="text"></span>
      <button ss-on:click="editing = true">Edit</button>
    </template>
    <template ss-if="editing">
      <input ss-model="text">
      <button ss-on:click="editing = false">Save</button>
    </template>
  </div>
</template>

<div id="list"></div>
<button onclick="addItem()">Add Item</button>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>SenangStart.init() Example</title>
  <style>
    .card { border: 1px solid #ddd; padding: 1rem; margin: 0.5rem 0; }
  </style>
</head>
<body>
  <div id="cards"></div>
  <button id="addBtn">Add Card</button>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
  <script>
    let cardId = 0
    
    document.getElementById('addBtn').addEventListener('click', () => {
      const card = document.createElement('div')
      card.className = 'card'
      card.innerHTML = `
        <div ss-data="{ id: ${++cardId}, likes: 0 }">
          <h3 ss-text="'Card #' + id"></h3>
          <button ss-on:click="likes++">
            ❤️ <span ss-text="likes"></span>
          </button>
          <button ss-on:click="$el.closest('.card').remove()">Delete</button>
        </div>
      `
      
      document.getElementById('cards').appendChild(card)
      SenangStart.init(card)
    })
  </script>
</body>
</html>
```

## Best Practices

1. **Initialize the smallest scope** - Pass the specific element, not `document.body`
2. **Initialize after DOM append** - Call `init()` after the element is in the DOM
3. **Avoid double initialization** - Don't call `init()` on already-initialized content

## Related

- [start()](/api/start) - Auto-initialization on page load
- [ss-data](/directives/ss-data) - Define reactive scopes
