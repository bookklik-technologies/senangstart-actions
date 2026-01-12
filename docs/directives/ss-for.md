# ss-for

The `ss-for` directive renders a list of elements by iterating over an array. Each iteration has access to the current item and optional index.

## Syntax

```html
<template ss-for="item in items">
  <!-- content repeated for each item -->
</template>

<!-- With index -->
<template ss-for="(item, index) in items">
  <!-- content with access to index -->
</template>
```

::: warning Important
`ss-for` must be used on a `<template>` element.
:::

## Basic Usage

### Simple List

```html
<div ss-data="{ fruits: ['Apple', 'Banana', 'Cherry'] }">
  <ul>
    <template ss-for="fruit in fruits">
      <li ss-text="fruit"></li>
    </template>
  </ul>
</div>
```

**Output:**
- Apple
- Banana
- Cherry

### With Index

```html
<div ss-data="{ items: ['First', 'Second', 'Third'] }">
  <template ss-for="(item, i) in items">
    <p ss-text="(i + 1) + '. ' + item"></p>
  </template>
</div>
```

**Output:**
- 1. First
- 2. Second
- 3. Third

## Array of Objects

```html
<div ss-data="{ 
  users: [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 }
  ]
}">
  <template ss-for="user in users">
    <div class="user-card">
      <h3 ss-text="user.name"></h3>
      <p ss-text="'Age: ' + user.age"></p>
    </div>
  </template>
</div>
```

## Modifying Arrays

### Adding Items

```html
<div ss-data="{ items: [], newItem: '' }">
  <input ss-model="newItem" placeholder="New item">
  <button ss-on:click="if(newItem.trim()) { items.push(newItem); newItem = '' }">
    Add
  </button>
  
  <template ss-for="item in items">
    <div ss-text="item"></div>
  </template>
</div>
```

### Removing Items

```html
<div ss-data="{ items: ['A', 'B', 'C'] }">
  <template ss-for="(item, i) in items">
    <div>
      <span ss-text="item"></span>
      <button ss-on:click="items.splice(i, 1)">Remove</button>
    </div>
  </template>
</div>
```

### Updating Items

```html
<div ss-data="{ todos: [
  { text: 'Learn SenangStart', done: false },
  { text: 'Build app', done: false }
]}">
  <template ss-for="todo in todos">
    <label>
      <input type="checkbox" ss-model="todo.done">
      <span ss-bind:style="todo.done ? 'text-decoration: line-through' : ''"
            ss-text="todo.text"></span>
    </label>
  </template>
</div>
```

## Multiple Elements per Iteration

A template can contain multiple root elements:

```html
<div ss-data="{ items: ['A', 'B'] }">
  <template ss-for="item in items">
    <dt ss-text="item"></dt>
    <dd ss-text="'Description for ' + item"></dd>
  </template>
</div>
```

## Nested Loops

```html
<div ss-data="{ 
  categories: [
    { name: 'Fruits', items: ['Apple', 'Banana'] },
    { name: 'Vegetables', items: ['Carrot', 'Broccoli'] }
  ]
}">
  <template ss-for="category in categories">
    <div>
      <h3 ss-text="category.name"></h3>
      <ul>
        <template ss-for="item in category.items">
          <li ss-text="item"></li>
        </template>
      </ul>
    </div>
  </template>
</div>
```

## Filtering and Sorting

### Filtered List

```html
<div ss-data="{ 
  items: ['Apple', 'Banana', 'Apricot', 'Cherry'],
  filter: ''
}">
  <input ss-model="filter" placeholder="Filter...">
  
  <template ss-for="item in items.filter(i => i.toLowerCase().includes(filter.toLowerCase()))">
    <div ss-text="item"></div>
  </template>
</div>
```

### Sorted List

```html
<div ss-data="{ 
  items: [3, 1, 4, 1, 5, 9, 2, 6],
  ascending: true
}">
  <button ss-on:click="ascending = !ascending" 
          ss-text="ascending ? 'Sort Descending' : 'Sort Ascending'">
  </button>
  
  <template ss-for="num in [...items].sort((a, b) => ascending ? a - b : b - a)">
    <span ss-text="num + ' '"></span>
  </template>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-for Example</title>
  <style>
    .todo-item { display: flex; gap: 1rem; padding: 0.5rem; }
    .todo-item.done { opacity: 0.5; }
    .todo-item.done span { text-decoration: line-through; }
  </style>
</head>
<body>
  <div ss-data="{ 
    todos: [
      { id: 1, text: 'Learn SenangStart', done: true },
      { id: 2, text: 'Build a project', done: false },
      { id: 3, text: 'Deploy to production', done: false }
    ],
    newTodo: '',
    nextId: 4,
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({ id: this.nextId++, text: this.newTodo, done: false })
        this.newTodo = ''
      }
    },
    removeTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id)
    }
  }">
    <h2>Todo List</h2>
    
    <div>
      <input ss-model="newTodo" 
             ss-on:keyup.enter="addTodo()" 
             placeholder="What needs to be done?">
      <button ss-on:click="addTodo()">Add</button>
    </div>
    
    <div>
      <template ss-for="todo in todos">
        <div class="todo-item" ss-bind:class="todo.done ? 'done' : ''">
          <input type="checkbox" ss-model="todo.done">
          <span ss-text="todo.text"></span>
          <button ss-on:click="removeTodo(todo.id)">×</button>
        </div>
      </template>
    </div>
    
    <p ss-text="`${todos.filter(t => t.done).length} of ${todos.length} completed`"></p>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Use unique identifiers** - Helps with efficient updates
2. **Avoid expensive operations in loops** - Pre-compute if possible
3. **Use spread operator for sorting** - `[...items].sort()` doesn't mutate original
4. **Keep template content simple** - Extract complex items to components

## Related Directives

- [ss-if](/directives/ss-if) - Conditional rendering
- [ss-data](/directives/ss-data) - Provide array data
- [ss-text](/directives/ss-text) - Display item properties
