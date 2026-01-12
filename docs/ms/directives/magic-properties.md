# Sifat Ajaib

SenangStart Actions menyediakan sifat "ajaib" khas yang tersedia dalam sebarang skop `ss-data`. Sifat ini memberi anda akses kepada fungsi berguna tanpa persediaan tambahan.

## $refs

Akses elemen DOM yang ditanda dengan `ss-ref`.

```html
<div ss-data="{}">
  <input type="text" ss-ref="nameInput">
  <button ss-on:click="$refs.nameInput.focus()">Fokus</button>
  <button ss-on:click="$refs.nameInput.value = ''">Kosongkan</button>
</div>
```

---

## $store

Akses stor global yang didaftarkan dengan `SenangStart.store()`.

### Mendaftarkan Stor

```javascript
SenangStart.store('user', {
  name: 'Tetamu',
  isLoggedIn: false,
  login(name) {
    this.name = name
    this.isLoggedIn = true
  },
  logout() {
    this.name = 'Tetamu'
    this.isLoggedIn = false
  }
})
```

### Menggunakan dalam HTML

```html
<div ss-data="{}">
  <p ss-text="'Selamat datang, ' + $store.user.name"></p>
  
  <button ss-show="!$store.user.isLoggedIn" 
          ss-on:click="$store.user.login('Ahmad')">
    Log Masuk
  </button>
  <button ss-show="$store.user.isLoggedIn"
          ss-on:click="$store.user.logout()">
    Log Keluar
  </button>
</div>
```

---

## $el

Rujukan kepada elemen DOM semasa.

```html
<div ss-data="{}">
  <div ss-on:click="$el.classList.toggle('active')">
    Klik untuk togol kelas active
  </div>
</div>
```

---

## $event

Akses objek peristiwa DOM natif dalam pengendali peristiwa.

```html
<div ss-data="{ lastClick: '' }">
  <div ss-on:click="lastClick = 'X: ' + $event.clientX + ', Y: ' + $event.clientY">
    Klik di mana-mana
  </div>
  <p ss-text="lastClick"></p>
</div>
```

---

## $dispatch

Hantar peristiwa DOM tersuai yang naik ke atas pokok.

### Penggunaan Asas

```html
<div ss-data="{ message: '' }" ss-on:notify="message = $event.detail.text">
  <p ss-text="message || 'Belum ada mesej'"></p>
  
  <button ss-on:click="$dispatch('notify', { text: 'Helo dari butang!' })">
    Hantar Mesej
  </button>
</div>
```

### Komunikasi Ibu-Anak

```html
<!-- Ibu -->
<div ss-data="{ items: [] }" ss-on:item-added="items.push($event.detail)">
  <h2>Item: <span ss-text="items.length"></span></h2>
  
  <!-- Anak -->
  <div ss-data="{ newItem: '' }">
    <input ss-model="newItem" placeholder="Nama item">
    <button ss-on:click="
      if (newItem) {
        $dispatch('item-added', { name: newItem });
        newItem = ''
      }
    ">Tambah Item</button>
  </div>
</div>
```

## Ringkasan

| Sifat | Tujuan | Contoh |
|-------|--------|--------|
| `$refs` | Akses elemen melalui rujukan | `$refs.input.focus()` |
| `$store` | Akses stor global | `$store.user.name` |
| `$el` | Elemen semasa | `$el.classList.add('active')` |
| `$event` | Objek peristiwa natif | `$event.target.value` |
| `$dispatch` | Hantar peristiwa tersuai | `$dispatch('save', data)` |

## Berkaitan

- [ss-ref](/ms/directives/ss-ref) - Tentukan rujukan elemen
- [ss-on](/ms/directives/ss-on) - Pengendalian peristiwa
- [Rujukan API](/ms/api/) - `SenangStart.store()`
