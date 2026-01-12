# $store

Akses stor global yang telah didaftarkan dengan `SenangStart.store()`.

## Sintaks

```javascript
$store.storeName.property
$store.storeName.method()
```

## Cara Ia Berfungsi

1. Daftarkan stor dengan `SenangStart.store(name, data)`
2. Akses melalui `$store.name` dalam mana-mana komponen

```javascript
SenangStart.store('user', {
  name: 'Tetamu',
  isLoggedIn: false
})
```

```html
<div ss-data="{}">
  <p ss-text="'Helo, ' + $store.user.name"></p>
</div>
```

## Membaca Nilai Stor

```javascript
SenangStart.store('app', {
  name: 'Aplikasi Saya',
  version: '1.0.0',
  debug: false
})
```

```html
<div ss-data="{}">
  <h1 ss-text="$store.app.name"></h1>
  <span ss-text="'v' + $store.app.version"></span>
</div>
```

## Memanggil Kaedah Stor

```javascript
SenangStart.store('counter', {
  value: 0,
  increment() { this.value++ },
  decrement() { this.value-- },
  reset() { this.value = 0 }
})
```

```html
<div ss-data="{}">
  <span ss-text="$store.counter.value"></span>
  <button ss-on:click="$store.counter.increment()">+</button>
  <button ss-on:click="$store.counter.decrement()">-</button>
</div>
```

## Perkongsian Merentas Komponen

Manfaat utama stor adalah berkongsi keadaan merentas komponen tidak berkaitan.

## Berkaitan

- [API store()](/ms/api/store) - Cara mendaftarkan stor
- [Sifat $refs](/ms/properties/refs) - Rujukan elemen
