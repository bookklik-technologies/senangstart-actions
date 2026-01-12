# SenangStart.init()

Inisialisasi pokok DOM secara manual. Berguna untuk kandungan yang ditambah secara dinamik yang tidak wujud semasa halaman pertama dimuatkan.

## Sintaks

```javascript
SenangStart.init(root)
```

## Parameter

| Parameter | Jenis | Lalai | Penerangan |
|-----------|-------|-------|------------|
| `root` | Element | `document.body` | Elemen akar untuk diinisialisasi |

## Bila Hendak Digunakan

SenangStart menginisialisasi semua atribut `ss-*` secara automatik apabila halaman dimuatkan. Walau bagaimanapun, anda perlu memanggil `init()` secara manual apabila:

1. **Kandungan dinamik** - HTML ditambah selepas halaman dimuatkan
2. **Respons AJAX** - Kandungan dimuatkan dari pelayan
3. **Rendering template** - HTML dijana dari template

## Penggunaan Asas

```javascript
// Cipta elemen baru dengan arahan SenangStart
const newElement = document.createElement('div')
newElement.innerHTML = `
  <div ss-data="{ count: 0 }">
    <button ss-on:click="count++">+</button>
    <span ss-text="count"></span>
  </div>
`
document.body.appendChild(newElement)

// Inisialisasi kandungan baru
SenangStart.init(newElement)
```

## Berkaitan

- [start()](/ms/api/start) - Inisialisasi automatik pada muatan halaman
- [ss-data](/ms/directives/ss-data) - Tentukan skop reaktif
