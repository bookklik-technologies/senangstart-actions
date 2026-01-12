# ss-for

Arahan `ss-for` merender senarai elemen dengan mengiterasi melalui array. Setiap iterasi mempunyai akses kepada item semasa dan indeks pilihan.

## Sintaks

```html
<template ss-for="item in items">
  <!-- kandungan diulang untuk setiap item -->
</template>

<!-- Dengan indeks -->
<template ss-for="(item, index) in items">
  <!-- kandungan dengan akses kepada indeks -->
</template>
```

## Penggunaan Asas

### Senarai Mudah

```html
<div ss-data="{ fruits: ['Epal', 'Pisang', 'Ceri'] }">
  <ul>
    <template ss-for="fruit in fruits">
      <li ss-text="fruit"></li>
    </template>
  </ul>
</div>
```

### Dengan Indeks

```html
<div ss-data="{ items: ['Pertama', 'Kedua', 'Ketiga'] }">
  <template ss-for="(item, i) in items">
    <p ss-text="(i + 1) + '. ' + item"></p>
  </template>
</div>
```

## Array Objek

```html
<div ss-data="{ 
  users: [
    { name: 'Ali', age: 25 },
    { name: 'Abu', age: 30 },
    { name: 'Ahmad', age: 35 }
  ]
}">
  <template ss-for="user in users">
    <div class="user-card">
      <h3 ss-text="user.name"></h3>
      <p ss-text="'Umur: ' + user.age"></p>
    </div>
  </template>
</div>
```

## Mengubah Array

### Menambah Item

```html
<div ss-data="{ items: [], newItem: '' }">
  <input ss-model="newItem" placeholder="Item baru">
  <button ss-on:click="if(newItem.trim()) { items.push(newItem); newItem = '' }">
    Tambah
  </button>
  
  <template ss-for="item in items">
    <div ss-text="item"></div>
  </template>
</div>
```

### Membuang Item

```html
<div ss-data="{ items: ['A', 'B', 'C'] }">
  <template ss-for="(item, i) in items">
    <div>
      <span ss-text="item"></span>
      <button ss-on:click="items.splice(i, 1)">Buang</button>
    </div>
  </template>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-for</title>
  <style>
    .todo-item { display: flex; gap: 1rem; padding: 0.5rem; }
    .todo-item.done span { text-decoration: line-through; opacity: 0.5; }
  </style>
</head>
<body>
  <div ss-data="{ 
    todos: [
      { id: 1, text: 'Belajar SenangStart', done: true },
      { id: 2, text: 'Bina projek', done: false },
      { id: 3, text: 'Deploy ke produksi', done: false }
    ],
    newTodo: '',
    nextId: 4,
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({ id: this.nextId++, text: this.newTodo, done: false })
        this.newTodo = ''
      }
    }
  }">
    <h2>Senarai Tugasan</h2>
    
    <div>
      <input ss-model="newTodo" 
             ss-on:keyup.enter="addTodo()" 
             placeholder="Apa yang perlu dilakukan?">
      <button ss-on:click="addTodo()">Tambah</button>
    </div>
    
    <div>
      <template ss-for="todo in todos">
        <div class="todo-item" ss-bind:class="todo.done ? 'done' : ''">
          <input type="checkbox" ss-model="todo.done">
          <span ss-text="todo.text"></span>
        </div>
      </template>
    </div>
    
    <p ss-text="`${todos.filter(t => t.done).length} daripada ${todos.length} selesai`"></p>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-if](/ms/directives/ss-if) - Rendering bersyarat
- [ss-data](/ms/directives/ss-data) - Sediakan data array
- [ss-text](/ms/directives/ss-text) - Paparkan sifat item
