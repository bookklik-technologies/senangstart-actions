# $dispatch

Hantar peristiwa DOM tersuai yang naik ke atas pokok elemen.

## Sintaks

```javascript
$dispatch(eventName)
$dispatch(eventName, detail)
```

## Parameter

| Parameter | Jenis | Penerangan |
|-----------|-------|------------|
| `eventName` | string | Nama peristiwa tersuai |
| `detail` | any | Data pilihan untuk dihantar dengan peristiwa |

## Cara Ia Berfungsi

1. Panggil `$dispatch('eventName', data)` pada elemen anak
2. Dengar dengan `ss-on:eventName` pada elemen ibu
3. Akses data melalui `$event.detail`

```html
<div ss-on:my-event="console.log($event.detail)">
  <button ss-on:click="$dispatch('my-event', { message: 'Helo!' })">
    Hantar Peristiwa
  </button>
</div>
```

## Penggunaan Asas

### Peristiwa Mudah

```html
<div ss-data="{ received: false }" ss-on:ping="received = true">
  <p ss-text="received ? 'Diterima!' : 'Menunggu...'"></p>
  <button ss-on:click="$dispatch('ping')">Hantar Ping</button>
</div>
```

### Dengan Data

```html
<div ss-data="{ message: '' }" ss-on:notify="message = $event.detail.text">
  <p ss-text="message || 'Tiada mesej'"></p>
  
  <button ss-on:click="$dispatch('notify', { text: 'Helo dari Butang 1' })">
    Butang 1
  </button>
</div>
```

## Kes Penggunaan

### Komunikasi Anak-ke-Ibu

```html
<!-- Komponen ibu -->
<div ss-data="{ items: [] }" ss-on:add-item="items.push($event.detail)">
  <h2>Item: <span ss-text="items.length"></span></h2>
  
  <!-- Komponen anak -->
  <div ss-data="{ newItem: '' }">
    <input ss-model="newItem" placeholder="Nama item">
    <button ss-on:click="
      if (newItem) {
        $dispatch('add-item', { name: newItem });
        newItem = ''
      }
    ">Tambah</button>
  </div>
</div>
```

### Tutup Modal

```html
<div ss-data="{ showModal: false }" ss-on:close-modal="showModal = false">
  <button ss-on:click="showModal = true">Buka Modal</button>
  
  <template ss-if="showModal">
    <div class="modal" ss-data="{}">
      <h2>Tajuk Modal</h2>
      <button ss-on:click="$dispatch('close-modal')">Tutup</button>
    </div>
  </template>
</div>
```

## Berkaitan

- [Arahan ss-on](/ms/directives/ss-on) - Mendengar peristiwa
- [Sifat $event](/ms/properties/event) - Mengakses butiran peristiwa
- [Sifat $store](/ms/properties/store) - Alternatif untuk keadaan global
