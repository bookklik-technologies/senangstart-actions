# ss-on

Arahan `ss-on` melampirkan pendengar peristiwa kepada elemen. Ia menyokong semua peristiwa DOM dengan modifier pilihan untuk corak biasa.

## Sintaks

```html
<element ss-on:event="expression"></element>
<element ss-on:event.modifier="expression"></element>
```

## Peristiwa Asas

### Klik

```html
<div ss-data="{ count: 0 }">
  <button ss-on:click="count++">Diklik <span ss-text="count"></span> kali</button>
</div>
```

### Peristiwa Papan Kekunci

```html
<div ss-data="{ value: '' }">
  <!-- Trigger hanya pada Enter -->
  <input ss-model="value" ss-on:keyup.enter="alert('Dihantar: ' + value)">
  
  <!-- Trigger hanya pada Escape -->
  <input ss-on:keydown.escape="value = ''">
</div>
```

## Peristiwa Borang

### Submit

```html
<div ss-data="{ email: '' }">
  <form ss-on:submit.prevent="console.log('Menghantar:', email)">
    <input type="email" ss-model="email" required>
    <button type="submit">Hantar</button>
  </form>
</div>
```

## Modifier Peristiwa

### .prevent

Memanggil `event.preventDefault()`:

```html
<a href="/somewhere" ss-on:click.prevent="handleClick()">
  Tidak akan navigate
</a>
```

### .stop

Memanggil `event.stopPropagation()`:

```html
<div ss-on:click="console.log('luar')">
  <button ss-on:click.stop="console.log('dalam')">
    Tidak akan trigger klik luar
  </button>
</div>
```

### .self

Trigger hanya jika sasaran peristiwa adalah elemen itu sendiri:

```html
<div ss-on:click.self="closeModal()" class="modal-backdrop">
  <div class="modal">
    Klik di sini tidak akan tutup
  </div>
</div>
```

## Mengakses Objek Event

Gunakan `$event` untuk mengakses peristiwa natif:

```html
<div ss-data="{}">
  <input ss-on:input="console.log($event.target.value)">
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-on</title>
  <style>
    .canvas { 
      width: 300px; 
      height: 200px; 
      border: 1px solid #ddd; 
      position: relative;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: red;
      border-radius: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
    }
  </style>
</head>
<body>
  <div ss-data="{ 
    clicks: [],
    addClick(e) {
      const rect = e.target.getBoundingClientRect()
      this.clicks.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    },
    clear() {
      this.clicks = []
    }
  }">
    <h2>Kanvas Klik</h2>
    
    <div class="canvas" ss-on:click="addClick($event)">
      <template ss-for="click in clicks">
        <div class="dot" ss-bind:style="'left:' + click.x + 'px; top:' + click.y + 'px'"></div>
      </template>
    </div>
    
    <p ss-text="clicks.length + ' klik'"></p>
    <button ss-on:click="clear()">Kosongkan</button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-model](/ms/directives/ss-model) - Pengikatan dua hala
- [ss-data](/ms/directives/ss-data) - Tentukan kaedah pengendali peristiwa
- [Sifat Ajaib](/ms/directives/magic-properties) - `$event`, `$dispatch`
