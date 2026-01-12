# Rujukan Arahan

SenangStart Actions menggunakan atribut HTML dengan awalan `ss-` untuk menambah tingkah laku reaktif kepada elemen.

## Arahan Teras

| Arahan | Penerangan |
|--------|------------|
| [ss-data](/ms/directives/ss-data) | Mentakrifkan skop data reaktif |
| [ss-text](/ms/directives/ss-text) | Mengikat kandungan teks |
| [ss-show](/ms/directives/ss-show) | Togol keterlihatan |
| [ss-if](/ms/directives/ss-if) | Rendering bersyarat |
| [ss-for](/ms/directives/ss-for) | Rendering senarai |

## Borang & Pengikatan

| Arahan | Penerangan |
|--------|------------|
| [ss-model](/ms/directives/ss-model) | Pengikatan data dua hala |
| [ss-bind](/ms/directives/ss-bind) | Pengikatan atribut |
| [ss-on](/ms/directives/ss-on) | Pengendalian peristiwa |

## Utiliti

| Arahan | Penerangan |
|--------|------------|
| [ss-ref](/ms/directives/ss-ref) | Rujukan elemen |
| [ss-effect](/ms/directives/ss-effect) | Kesan sampingan |
| [ss-transition](/ms/directives/ss-transition) | Transisi CSS |
| [ss-cloak](/ms/directives/ss-cloak) | Sembunyikan sehingga sedia |

## Contoh Pantas

### Pembilang

```html
<div ss-data="{ count: 0 }">
  <button ss-on:click="count--">-</button>
  <span ss-text="count"></span>
  <button ss-on:click="count++">+</button>
</div>
```

### Togol

```html
<div ss-data="{ open: false }">
  <button ss-on:click="open = !open" ss-text="open ? 'Sembunyi' : 'Tunjuk'"></button>
  <div ss-show="open" ss-transition>Kandungan tersembunyi</div>
</div>
```

::: tip Sifat
Untuk sifat khas seperti `$refs`, `$store`, `$el`, `$event`, dan `$dispatch`, lihat bahagian [Sifat](/ms/properties/).
:::
