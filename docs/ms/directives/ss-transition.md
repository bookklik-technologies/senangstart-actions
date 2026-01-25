# ss-transition

Arahan `ss-transition` membolehkan anda menggunakan transisi CSS kepada elemen apabila ia masuk atau keluar dari DOM (ditogol melalui `ss-show` atau `ss-if`).

## Sintaks

```html
<!-- Asas -->
<div ss-show="open" ss-transition></div>

<!-- Dengan Pengubahsuai -->
<div ss-show="open" ss-transition.duration.500ms.scale.90></div>

<!-- Kawalan Terperinci -->
<div ss-show="open" 
     ss-transition:enter.duration.200ms.ease-out
     ss-transition:leave.duration.100ms.ease-in>
</div>
```

## Pengubahsuai (Modifiers)

SenangStart menyediakan sintaks ringkas untuk mengkonfigurasi transisi secara terus dalam atribut.

| Pengubahsuai | Penerangan | Contoh |
| :--- | :--- | :--- |
| `.duration.{ms}` | Tetapkan tempoh transisi | `.duration.300ms`, `.duration.2s` |
| `.delay.{ms}` | Tetapkan lengah masa transisi | `.delay.100ms` |
| `.opacity.{0-100}` | Tetapkan kelegapan mula/akhir | `.opacity.0` (pudar dari 0) |
| `.scale.{0-100}` | Tetapkan skala mula/akhir | `.scale.90` (skala naik dari 0.9) |
| `.easing.{name}` | Tetapkan fungsi masa | `.easing.ease-out`, `.easing.linear` |

### Contoh Pengubahsuai

```html
<div ss-show="open" 
     ss-transition.duration.300ms.opacity.0.scale.80.easing.ease-out>
  Saya akan pudar masuk, membesar, dan keluar dengan lancar!
</div>
```

Ini secara efektif menetapkan:
- **Masuk**: Bermula pada `opacity: 0`, `transform: scale(0.8)`. Transisi ke `1` / `1.0` selama `300ms`.
- **Keluar**: Transisi dari `1` / `1.0` kembali ke `opacity: 0`, `transform: scale(0.8)` selama `300ms`.

## Fasa Khusus

Anda boleh menyesuaikan fasa *Masuk* dan *Keluar* secara berasingan menggunakan `ss-transition:enter` dan `ss-transition:leave`.

```html
<div ss-show="open"
     ss-transition:enter.duration.500ms.delay.200ms
     ss-transition:leave.duration.100ms>
     
    Saya masuk perlahan selepas lengah masa, tapi keluar dengan pantas.
</div>
```

## Transisi Berasaskan Kelas

Jika anda lebih suka menggunakan kelas CSS (serasi dengan konvensyen Vue/Alpine), `ss-transition` tanpa pengubahsuai (atau bersamanya) menggunakan kelas berikut sepanjang kitaran hayat:

| Kelas | Digunakan Apabila | Penerangan |
| :--- | :--- | :--- |
| `ss-enter-from` | Bingkai permulaan masuk | Keadaan awal (cth: `opacity: 0`) |
| `ss-enter-active`| Semasa fasa masuk | Sifat transisi (cth: `transition: opacity 200ms`) |
| `ss-enter-to` | Bingkai akhir masuk | Keadaan akhir (cth: `opacity: 1`) |
| `ss-leave-from` | Bingkai permulaan keluar | Keadaan awal sebelum keluar |
| `ss-leave-active`| Semasa fasa keluar | Sifat transisi |
| `ss-leave-to` | Bingkai akhir keluar | Keadaan akhir selepas keluar |

**Nota**: Jika anda menggunakan pengubahsuai seperti `.duration`, gaya inline akan mensimulasikan kelas `*-active`, tetapi kelas `*-from` dan `*-to` masih ditogol untuk membantu anda menjejak keadaan.

### Contoh CSS

```css
.ss-enter-active, .ss-leave-active {
    transition: all 0.5s ease;
}
.ss-enter-from, .ss-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
```

```html
<div ss-show="open" ss-transition>
   Kandungan menggunakan kelas CSS mudah
</div>
```
