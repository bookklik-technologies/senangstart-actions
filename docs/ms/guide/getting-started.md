# Mula Menggunakan

SenangStart Actions adalah rangka kerja JavaScript yang ringan dan deklaratif untuk membina antara muka pengguna reaktif tanpa langkah pembinaan.

## Pemasangan

### CDN (Disyorkan)

Tambah tag skrip ke HTML anda:

```html
<script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
```

Atau gunakan jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions"></script>
```

### npm

```bash
npm install @bookklik/senangstart-actions
```

```javascript
import SenangStart from '@bookklik/senangstart-actions'
```

## Penggunaan Asas

### Data Reaktif dengan `ss-data`

Atribut `ss-data` mentakrifkan skop reaktif dengan data awal:

```html
<div ss-data="{ message: 'Helo, Dunia!' }">
  <p ss-text="message"></p>
</div>
```

### Pengikatan Teks dengan `ss-text`

Gunakan `ss-text` untuk mengikat data kepada kandungan teks elemen:

```html
<div ss-data="{ name: 'SenangStart' }">
  <h1 ss-text="'Selamat datang ke ' + name"></h1>
</div>
```

### Pengendalian Peristiwa dengan `ss-on`

Kendalikan peristiwa DOM dengan `ss-on:eventname`:

```html
<div ss-data="{ count: 0 }">
  <p ss-text="count"></p>
  <button ss-on:click="count++">+</button>
  <button ss-on:click="count--">-</button>
</div>
```

## Aplikasi Pertama Anda

Berikut adalah contoh pembilang lengkap:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Aplikasi SenangStart Pertama Saya</title>
</head>
<body>
  <div ss-data="{ count: 0 }">
    <h1>Pembilang: <span ss-text="count">0</span></h1>
    <button ss-on:click="count++">Tambah</button>
    <button ss-on:click="count--">Kurang</button>
    <button ss-on:click="count = 0">Set Semula</button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Untuk Pembantu AI

Jika anda menggunakan pembantu pengekodan AI (seperti Cursor, Windsurf, atau lain-lain), anda boleh membekalkan fail konteks khusus kami kepada mereka. Fail ini mengandungi penuh arahan dan sifat yang tersedia dalam format yang disokong oleh LLMs.

Fail konteks: [`https://bookklik-technologies.github.io/senangstart-actions/llms.txt`](https://bookklik-technologies.github.io/senangstart-actions/llms.txt)

## Langkah Seterusnya

- Pelajari tentang semua [Arahan](/ms/directives/) yang tersedia
- Terokai [Rujukan API](/ms/api/)
