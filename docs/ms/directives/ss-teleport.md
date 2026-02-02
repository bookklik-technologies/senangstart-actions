# ss-teleport

Arahan `ss-teleport` membolehkan anda memindahkan (teleport) sebahagian daripada templat anda ke lokasi DOM lain (seperti tag `<body>`), sambil mengekalkan logik dan skop reaktif dari tempat ia didefinisikan. Ini berguna untuk modal, tooltip, dan menu terapung yang perlu keluar daripada kekangan `z-index` atau `overflow: hidden` ibu bapa mereka.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-teleport.min.js"></script>
```

## Sintaks

```html
<template ss-teleport="pemilih">...</template>
```

Nilai mestilah rentetan pemilih CSS yang sah (contohnya, `'body'`, `'#modals'`, `'.footer'`).

## Penggunaan Asas

### Contoh Modal

```html
<div ss-data="{ open: false }">
    <button ss-on:click="open = true">Buka Modal</button>

    <!-- Kandungan di dalam ini secara logik adalah sebahagian daripada komponen, 
         tetapi secara teknikal dipaparkan di hujung <body> -->
    <template ss-teleport="body">
        <div class="modal-wrapper" ss-show="open">
            <div class="modal-content">
                <h2>Saya berada di dalam Body!</h2>
                <button ss-on:click="open = false">Tutup</button>
            </div>
        </div>
    </template>
</div>
```

## Tingkah Laku

1. **Pengekalan Reaktiviti**: Walaupun nod DOM dipindahkan, mereka berkongsi `skop` yang sama seperti komponen ibu bapa. Mengemas kini `open` dalam ibu bapa mengemas kini kandungan yang diteleport dengan betul.
2. **Event Bubbling**: Peristiwa DOM asli akan "bubble" naik pokok DOM dari *lokasi teleport*, bukan lokasi templat. Walau bagaimanapun, tindakan `ss-on` biasanya menyasarkan pemprosesan data tertentu, yang berfungsi lancar melalui skop.
3. **Titik Pelekatan**: Elemen sasaran mesti wujud dalam DOM apabila komponen dimulakan. Menggunakan `'body'` adalah pilihan paling selamat dan biasa.

## Amalan Terbaik

- Sentiasa gunakan tag `<template>` untuk teleportasi bagi mengelakkan kandungan dipaparkan di lokasi asal sebelum diteleport.
- Pastikan pemilih sasaran adalah unik jika menyasarkan ID.
