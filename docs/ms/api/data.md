# SenangStart.data()

Daftarkan komponen data boleh guna semula yang boleh dirujuk dengan nama dalam atribut `ss-data`.

## Sintaks

```javascript
SenangStart.data(name, factory)
```

## Parameter

| Parameter | Jenis | Penerangan |
|-----------|-------|------------|
| `name` | string | Nama komponen untuk didaftarkan |
| `factory` | function | Fungsi kilang yang mengembalikan objek data |

## Penggunaan Asas

```javascript
SenangStart.data('counter', () => ({
  count: 0,
  increment() { this.count++ },
  decrement() { this.count-- },
  reset() { this.count = 0 }
}))
```

```html
<div ss-data="counter">
  <p ss-text="count"></p>
  <button ss-on:click="increment()">+</button>
  <button ss-on:click="decrement()">-</button>
  <button ss-on:click="reset()">Set Semula</button>
</div>
```

## Mengapa Komponen Bernama?

### 1. Kebolehgunaan Semula

Gunakan logik komponen yang sama merentasi pelbagai elemen:

```javascript
SenangStart.data('dropdown', () => ({
  open: false,
  toggle() { this.open = !this.open },
  close() { this.open = false }
}))
```

```html
<!-- Pelbagai contoh, setiap satu dengan keadaan sendiri -->
<div ss-data="dropdown">
  <button ss-on:click="toggle()">Menu 1</button>
  <ul ss-show="open">...</ul>
</div>

<div ss-data="dropdown">
  <button ss-on:click="toggle()">Menu 2</button>
  <ul ss-show="open">...</ul>
</div>
```

### 2. HTML Lebih Bersih

Alihkan logik kompleks keluar dari atribut:

```html
<!-- Guna ini -->
<div ss-data="todoList">
```

## Berkaitan

- [Arahan ss-data](/ms/directives/ss-data) - Menggunakan komponen dalam HTML
- [store()](/ms/api/store) - Pengurusan keadaan global
