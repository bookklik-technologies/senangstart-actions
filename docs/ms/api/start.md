# SenangStart.start()

Mulakan framework SenangStart. Kaedah ini dipanggil secara automatik apabila skrip dimuatkan, tetapi boleh dipanggil secara manual jika diperlukan.

## Sintaks

```javascript
SenangStart.start()
```

## Tingkah Laku Mula Automatik

Apabila anda memasukkan skrip SenangStart, ia secara automatik:

1. Menunggu DOM sedia (`DOMContentLoaded`)
2. Memanggil `init(document.body)` untuk memproses semua atribut `ss-*`
3. Menyediakan MutationObserver untuk memerhati kandungan dinamik

```html
<!-- SenangStart bermula secara automatik apabila ini dimuatkan -->
<script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
```

## Apa Yang start() Lakukan

1. **Semak keadaan sedia dokumen**
   - Jika memuatkan, tunggu `DOMContentLoaded`
   - Jika sudah sedia, teruskan segera

2. **Inisialisasi DOM**
   - Panggil `init(document.body)`
   - Proses semua atribut `ss-*`

3. **Sediakan observer**
   - Pantau kandungan yang ditambah secara dinamik
   - Auto-inisialisasi elemen baru dengan atribut `ss-*`

## Berkaitan

- [init()](/ms/api/init) - Inisialisasi manual untuk kandungan dinamik
- [data()](/ms/api/data) - Daftarkan komponen sebelum mula
- [store()](/ms/api/store) - Daftarkan stor sebelum mula
