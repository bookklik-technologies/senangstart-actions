# ss-bind

Arahan `ss-bind` mengikat atribut HTML secara dinamik kepada ekspresi. Gunakannya untuk menetapkan kelas, gaya, keadaan disabled, dan sebarang atribut lain berdasarkan data anda.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-bind.min.js"></script>
```

## Sintaks

```html
<element ss-bind:attribute="expression"></element>
```

## Pengikatan Biasa

### Pengikatan Kelas

```html
<div ss-data="{ isActive: false, hasError: false }">
  <div ss-bind:class="isActive ? 'active' : ''">Togol saya</div>
  <button ss-on:click="isActive = !isActive">Togol Active</button>
</div>
```

### Pengikatan Gaya

```html
<div ss-data="{ color: 'blue', size: 16 }">
  <p ss-bind:style="'color: ' + color + '; font-size: ' + size + 'px'">
    Teks bergaya
  </p>
  <input type="color" ss-model="color">
  <input type="range" ss-model="size" min="12" max="48">
</div>
```

### Keadaan Disabled

```html
<div ss-data="{ isLoading: false }">
  <button ss-bind:disabled="isLoading" 
          ss-on:click="isLoading = true">
    <span ss-text="isLoading ? 'Memuatkan...' : 'Hantar'"></span>
  </button>
</div>
```

### Href dan Src

```html
<div ss-data="{ 
  userId: 123,
  imageUrl: 'https://example.com/avatar.jpg'
}">
  <a ss-bind:href="'/users/' + userId">Lihat Profil</a>
  <img ss-bind:src="imageUrl" ss-bind:alt="'Pengguna ' + userId">
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-bind</title>
  <style>
    .card { padding: 1rem; border: 1px solid #ddd; margin: 1rem 0; }
    .card-primary { border-color: #007bff; background: #e7f1ff; }
    .card-success { border-color: #28a745; background: #e8f5e9; }
    .shadow { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .rounded { border-radius: 8px; }
  </style>
</head>
<body>
  <div ss-data="{ 
    variant: 'primary',
    hasShadow: true,
    isRounded: true
  }">
    <h2>Penyesuai Kad</h2>
    
    <div ss-bind:class="
      'card ' + 
      'card-' + variant + ' ' + 
      (hasShadow ? 'shadow ' : '') + 
      (isRounded ? 'rounded' : '')
    ">
      <h3>Pratonton Kad</h3>
      <p>Kad ini dikemas kini berdasarkan pilihan anda.</p>
    </div>
    
    <div>
      <select ss-model="variant">
        <option value="primary">Primary</option>
        <option value="success">Success</option>
      </select>
      <label><input type="checkbox" ss-model="hasShadow"> Bayang</label>
      <label><input type="checkbox" ss-model="isRounded"> Bulat</label>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-text](/ms/directives/ss-text) - Ikat kandungan teks
- [ss-show](/ms/directives/ss-show) - Togol keterlihatan
- [ss-data](/ms/directives/ss-data) - Sediakan data pengikatan
