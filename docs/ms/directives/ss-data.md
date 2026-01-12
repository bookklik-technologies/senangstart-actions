# ss-data

Arahan `ss-data` mentakrifkan skop data reaktif untuk elemen dan semua anak-anaknya. Ini adalah asas kepada reaktiviti SenangStart Actions.

## Sintaks

```html
<div ss-data="{ property: value, ... }">
  <!-- elemen anak boleh mengakses property ini -->
</div>
```

## Penggunaan Asas

### Objek Data Sebaris

Tentukan sifat reaktif secara langsung dalam atribut:

```html
<div ss-data="{ name: 'Ali', age: 25, isActive: true }">
  <p ss-text="name"></p>
  <p ss-text="age"></p>
</div>
```

### Dengan Kaedah

Anda boleh memasukkan kaedah dalam objek data anda:

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

## Komponen Berdaftar

Daripada objek sebaris, anda boleh merujuk komponen bernama yang didaftarkan dengan `SenangStart.data()`:

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
  <button ss-on:click="reset()">Set Semula</button>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-data</title>
</head>
<body>
  <div ss-data="{ 
    tasks: ['Belajar SenangStart', 'Bina aplikasi', 'Deploy'],
    newTask: '',
    addTask() {
      if (this.newTask.trim()) {
        this.tasks.push(this.newTask)
        this.newTask = ''
      }
    }
  }">
    <h2>Senarai Tugasan</h2>
    
    <div>
      <input type="text" ss-model="newTask" placeholder="Tugasan baru...">
      <button ss-on:click="addTask()">Tambah</button>
    </div>
    
    <ul>
      <template ss-for="(task, i) in tasks">
        <li ss-text="task"></li>
      </template>
    </ul>
    
    <p ss-text="'Jumlah: ' + tasks.length + ' tugasan'"></p>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-text](/ms/directives/ss-text) - Paparkan data reaktif
- [ss-model](/ms/directives/ss-model) - Pengikatan data dua hala
- [ss-on](/ms/directives/ss-on) - Kendalikan peristiwa untuk mengubah data
