# ss-ref

Arahan `ss-ref` menetapkan rujukan kepada elemen yang boleh diakses secara pengaturcaraan melalui `$refs`.

## Sintaks

```html
<element ss-ref="referenceName"></element>
```

## Penggunaan Asas

### Fokus Input

```html
<div ss-data="{}">
  <input type="text" ss-ref="nameInput" placeholder="Masukkan nama">
  <button ss-on:click="$refs.nameInput.focus()">Fokus Input</button>
</div>
```

### Dapatkan/Tetapkan Nilai

```html
<div ss-data="{ savedValue: '' }">
  <input type="text" ss-ref="myInput">
  <button ss-on:click="savedValue = $refs.myInput.value">Simpan</button>
  <button ss-on:click="$refs.myInput.value = ''">Kosongkan</button>
  <p ss-text="'Disimpan: ' + savedValue"></p>
</div>
```

## Kes Penggunaan Biasa

### Kawalan Media

```html
<div ss-data="{ isPlaying: false }">
  <video ss-ref="video" src="video.mp4" width="400"></video>
  
  <button ss-on:click="$refs.video.play(); isPlaying = true">Main</button>
  <button ss-on:click="$refs.video.pause(); isPlaying = false">Jeda</button>
  <button ss-on:click="$refs.video.currentTime = 0">Mula Semula</button>
</div>
```

### Skrol ke Elemen

```html
<div ss-data="{}">
  <button ss-on:click="$refs.section.scrollIntoView({ behavior: 'smooth' })">
    Skrol ke Bahagian
  </button>
  
  <div style="height: 1000px;">Skrol ke bawah...</div>
  
  <div ss-ref="section">
    <h2>Bahagian Sasaran</h2>
    <p>Anda skrol ke sini!</p>
  </div>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-ref</title>
  <style>
    .tabs { display: flex; gap: 0.5rem; }
    .tab { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; }
    .tab.active { background: #007bff; color: white; }
    .panel { padding: 1rem; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div ss-data="{ activeTab: 0 }">
    <div class="tabs">
      <div ss-ref="tab0" class="tab" ss-bind:class="activeTab === 0 ? 'active' : ''" 
           ss-on:click="activeTab = 0">Tab 1</div>
      <div ss-ref="tab1" class="tab" ss-bind:class="activeTab === 1 ? 'active' : ''" 
           ss-on:click="activeTab = 1">Tab 2</div>
    </div>
    
    <div class="panel">
      <template ss-if="activeTab === 0">
        <h3>Panel 1</h3>
        <p>Kandungan untuk tab 1</p>
      </template>
      <template ss-if="activeTab === 1">
        <h3>Panel 2</h3>
        <p>Kandungan untuk tab 2</p>
      </template>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-on](/ms/directives/ss-on) - Gunakan refs dalam pengendali peristiwa
- [ss-data](/ms/directives/ss-data) - Tentukan kaedah yang menggunakan refs
- [Sifat Ajaib](/ms/directives/magic-properties) - Objek `$refs`
