# SenangStart.store()

Daftarkan stor reaktif global yang boleh diakses dari mana-mana komponen menggunakan `$store`.

## Sintaks

```javascript
SenangStart.store(name, data)
```

## Parameter

| Parameter | Jenis | Penerangan |
|-----------|-------|------------|
| `name` | string | Nama stor |
| `data` | object | Objek data stor dengan sifat dan kaedah |

## Penggunaan Asas

```javascript
SenangStart.store('user', {
  name: 'Tetamu',
  email: '',
  isLoggedIn: false
})
```

```html
<div ss-data="{}">
  <p ss-text="'Selamat datang, ' + $store.user.name"></p>
  <p ss-show="$store.user.isLoggedIn" ss-text="$store.user.email"></p>
</div>
```

## Dengan Kaedah

```javascript
SenangStart.store('auth', {
  user: null,
  isLoggedIn: false,
  
  login(userData) {
    this.user = userData
    this.isLoggedIn = true
  },
  
  logout() {
    this.user = null
    this.isLoggedIn = false
  }
})
```

## Komunikasi Merentas Komponen

Stor membolehkan perkongsian keadaan merentas komponen tidak berkaitan:

```html
<!-- Header -->
<header ss-data="{}">
  Troli: <span ss-text="$store.cart.items.length"></span> item
</header>

<!-- Senarai produk -->
<div ss-data="{ products: [...] }">
  <template ss-for="product in products">
    <button ss-on:click="$store.cart.add(product)">Tambah</button>
  </template>
</div>
```

## Berkaitan

- [data()](/ms/api/data) - Daftarkan data komponen tempatan
- [Sifat $store](/ms/properties/store) - Mengakses stor dalam template
