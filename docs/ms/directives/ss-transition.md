# ss-transition

Arahan `ss-transition` membolehkan transisi CSS apabila elemen ditunjukkan atau disembunyikan dengan `ss-show`. Ia menggunakan kelas transisi yang boleh anda gaya dengan CSS.

## Sintaks

```html
<element ss-show="condition" ss-transition></element>
```

## Cara Ia Berfungsi

Apabila elemen dengan `ss-transition` ditunjukkan atau disembunyikan, SenangStart menggunakan kelas berikut:

### Masuk (showing)
- `ss-enter-from` - Keadaan awal sebelum masuk
- `ss-enter-active` - Digunakan sepanjang fasa masuk
- `ss-enter-to` - Keadaan akhir selepas masuk

### Keluar (hiding)
- `ss-leave-from` - Keadaan awal sebelum keluar
- `ss-leave-active` - Digunakan sepanjang fasa keluar
- `ss-leave-to` - Keadaan akhir selepas keluar

## Contoh Transisi

### Pudar

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
  }
</style>

<div ss-data="{ show: true }">
  <button ss-on:click="show = !show">Togol</button>
  <div ss-show="show" ss-transition>
    Kandungan ini memudar masuk dan keluar
  </div>
</div>
```

### Gelongsor Turun

```html
<style>
  .ss-enter-active,
  .ss-leave-active {
    transition: all 0.3s ease;
  }
  
  .ss-enter-from,
  .ss-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-transition</title>
  <style>
    .accordion-content { overflow: hidden; }
    .ss-enter-active, .ss-leave-active {
      transition: all 0.3s ease;
    }
    .ss-enter-from, .ss-leave-to {
      opacity: 0;
      max-height: 0;
    }
    .accordion-item { border: 1px solid #ddd; margin: 0.5rem 0; }
    .accordion-header { padding: 1rem; cursor: pointer; background: #f5f5f5; }
    .accordion-body { padding: 1rem; }
  </style>
</head>
<body>
  <div ss-data="{ 
    items: [
      { title: 'Bahagian 1', content: 'Kandungan bahagian 1', open: false },
      { title: 'Bahagian 2', content: 'Kandungan bahagian 2', open: false }
    ]
  }">
    <template ss-for="item in items">
      <div class="accordion-item">
        <div class="accordion-header" ss-on:click="item.open = !item.open">
          <span ss-text="item.title"></span>
          <span ss-text="item.open ? '▲' : '▼'" style="float: right;"></span>
        </div>
        <div ss-show="item.open" ss-transition class="accordion-content">
          <div class="accordion-body" ss-text="item.content"></div>
        </div>
      </div>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-show](/ms/directives/ss-show) - Kawal keterlihatan
- [ss-if](/ms/directives/ss-if) - Rendering bersyarat (tiada transisi)
