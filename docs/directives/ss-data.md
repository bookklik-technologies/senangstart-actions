# ss-data

The `ss-data` directive defines a reactive data scope for an element and all its children. This is the foundation of SenangStart Actions reactivity.

## Syntax

```html
<div ss-data="{ property: value, ... }">
  <!-- child elements can access these properties -->
</div>
```

## Basic Usage

### Inline Data Object

Define reactive properties directly in the attribute:

```html
<div ss-data="{ name: 'John', age: 25, isActive: true }">
  <p ss-text="name"></p>
  <p ss-text="age"></p>
</div>
```

### With Methods

You can include methods in your data object:

```html
<div ss-data="{ 
  count: 0, 
  increment() { this.count++ },
  decrement() { this.count-- }
}">
  <p ss-text="count"></p>
  <button ss-on:click="increment()">+</button>
  <button ss-on:click="decrement()">-</button>
</div>
```

### With Computed Values

Access computed values using expressions:

```html
<div ss-data="{ firstName: 'John', lastName: 'Doe' }">
  <p ss-text="firstName + ' ' + lastName"></p>
</div>
```

## Registered Components

Instead of inline objects, you can reference a named component registered with `SenangStart.data()`:

```html
<script>
SenangStart.data('counter', () => ({
  count: 0,
  increment() { this.count++ },
  reset() { this.count = 0 }
}))
</script>

<div ss-data="counter">
  <p ss-text="count"></p>
  <button ss-on:click="increment()">+</button>
  <button ss-on:click="reset()">Reset</button>
</div>
```

This approach is useful for:
- Reusing the same data structure across multiple elements
- Keeping HTML clean and readable
- Testing data logic separately

## Nested Scopes

Child elements with `ss-data` create nested scopes. Inner scopes can access outer scope properties:

```html
<div ss-data="{ parentValue: 'Hello' }">
  <p ss-text="parentValue"></p>
  
  <div ss-data="{ childValue: 'World' }">
    <!-- Can access both parentValue and childValue -->
    <p ss-text="parentValue + ' ' + childValue"></p>
  </div>
</div>
```

## Live Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>ss-data Example</title>
</head>
<body>
  <div ss-data="{ 
    tasks: ['Learn SenangStart', 'Build an app', 'Deploy'],
    newTask: '',
    addTask() {
      if (this.newTask.trim()) {
        this.tasks.push(this.newTask)
        this.newTask = ''
      }
    }
  }">
    <h2>Todo List</h2>
    
    <div>
      <input type="text" ss-model="newTask" placeholder="New task...">
      <button ss-on:click="addTask()">Add</button>
    </div>
    
    <ul>
      <template ss-for="(task, i) in tasks">
        <li ss-text="task"></li>
      </template>
    </ul>
    
    <p ss-text="'Total: ' + tasks.length + ' tasks'"></p>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Best Practices

1. **Keep data objects focused** - Each scope should contain only the data it needs
2. **Use meaningful property names** - Choose descriptive names like `isLoading` instead of `l`
3. **Use registered components for complex logic** - Keeps HTML clean and logic testable
4. **Initialize all properties** - Declare all properties upfront for better reactivity

## Related Directives

- [ss-text](/directives/ss-text) - Display reactive data
- [ss-model](/directives/ss-model) - Two-way data binding
- [ss-on](/directives/ss-on) - Handle events to modify data
