---
layout: home

hero:
  name: SenangStart Actions
  text: Rangka Kerja Deklaratif Ringan
  tagline: Rangka kerja JavaScript yang ringan, mesra AI, dan deklaratif untuk membina UI reaktif
  actions:
    - theme: brand
      text: Mula Sekarang
      link: /ms/guide/getting-started
    - theme: alt
      text: Lihat di GitHub
      link: https://github.com/bookklik-technologies/senangstart-actions
  image:
    src: https://senangstart.com/img/use_senangstart.svg
    alt: SenangStart Actions

features:
  - icon: ⚡
    title: Ringan
    details: Saiz minimum tanpa langkah pembinaan diperlukan. Hanya sertakan skrip dan mula membina.
  - icon: 🔄
    title: Reaktif
    details: Kemas kini DOM automatik apabila data anda berubah. Tiada manipulasi DOM manual diperlukan.
  - icon: 🤖
    title: Mesra AI
    details: Sintaks deklaratif yang mudah difahami dan dijana dengan pembantu AI.
  - icon: 📝
    title: Deklaratif
    details: Gunakan atribut HTML untuk menentukan tingkah laku. Tiada JavaScript kompleks diperlukan.
---

## Contoh Pantas

```html
<div ss-data="{ count: 0 }">
  <p ss-text="count">0</p>
  <button ss-on:click="count++">Tambah</button>
</div>

<script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
```
