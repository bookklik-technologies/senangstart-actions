# ss-show

Arahan `ss-show` togol keterlihatan elemen berdasarkan syarat. Ia menggunakan CSS `display: none` untuk menyembunyikan elemen sambil mengekalkannya dalam DOM.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-show.min.js"></script>
```

## Sintaks

```html
<element ss-show="condition"></element>
```

## Penggunaan Asas

```html
<div ss-data="{ isVisible: true }">
  <button ss-on:click="isVisible = !isVisible">Togol</button>
  <div ss-show="isVisible">
    Kandungan ini kelihatan apabila isVisible adalah true
  </div>
</div>
```

## Dengan Transisi

Tambah `ss-transition` untuk animasi lancar:

```html
<div ss-data="{ open: false }">
  <button ss-on:click="open = !open">Togol</button>
  
  <div ss-show="open" ss-transition>
    Ini memudar masuk dan keluar dengan lancar
  </div>
</div>
```

## ss-show vs ss-if

| Aspek | ss-show | ss-if |
|-------|---------|-------|
| Elemen dalam DOM | Sentiasa | Hanya apabila true |
| Kos togol | Rendah (CSS sahaja) | Lebih tinggi (manipulasi DOM) |
| Render awal | Render tersembunyi | Tidak render |
| Kes penggunaan | Togol kerap | Kandungan bersyarat |

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-show</title>
  <style>
    .ss-enter-active, .ss-leave-active {
      transition: opacity 0.2s ease;
    }
    .ss-enter-from, .ss-leave-to {
      opacity: 0;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: white;
      padding: 2rem;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div ss-data="{ showModal: false }">
    <button ss-on:click="showModal = true">Buka Modal</button>
    
    <div ss-show="showModal" ss-transition class="modal-backdrop" 
         ss-on:click.self="showModal = false">
      <div class="modal">
        <h2>Tajuk Modal</h2>
        <p>Ini adalah dialog modal.</p>
        <button ss-on:click="showModal = false">Tutup</button>
      </div>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-if](/ms/directives/ss-if) - Rendering bersyarat (buang dari DOM)
- [ss-transition](/ms/directives/ss-transition) - Animasi tunjuk/sembunyi
- [ss-cloak](/ms/directives/ss-cloak) - Sembunyi sehingga diinisialisasi
