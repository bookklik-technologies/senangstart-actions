# ss-effect

Arahan `ss-effect` menjalankan kesan sampingan apabila kebergantungannya berubah. Ia berguna untuk logging, panggilan API, atau sebarang tindakan yang perlu berlaku sebagai respons kepada perubahan data.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-effect.min.js"></script>
```

## Sintaks

```html
<element ss-effect="expression"></element>
```

## Penggunaan Asas

### Mencatat Perubahan

```html
<div ss-data="{ count: 0 }" ss-effect="console.log('Count berubah kepada:', count)">
  <button ss-on:click="count++">Tambah</button>
  <p ss-text="count"></p>
</div>
```

Setiap kali `count` berubah, konsol mencatat nilai baru.

## Corak Biasa

### Sinkronisasi Local Storage

```html
<div ss-data="{ preferences: { theme: 'light', fontSize: 16 } }"
     ss-effect="localStorage.setItem('prefs', JSON.stringify(preferences))">
  <select ss-model="preferences.theme">
    <option value="light">Cerah</option>
    <option value="dark">Gelap</option>
  </select>
  <input type="range" ss-model="preferences.fontSize" min="12" max="24">
</div>
```

### Tajuk Dokumen

```html
<div ss-data="{ pageTitle: 'Utama' }"
     ss-effect="document.title = pageTitle + ' | Aplikasi Saya'">
  <select ss-model="pageTitle">
    <option value="Utama">Utama</option>
    <option value="Tentang">Tentang</option>
    <option value="Hubungi">Hubungi</option>
  </select>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-effect</title>
  <style>
    .log { font-family: monospace; background: #f5f5f5; padding: 1rem; }
  </style>
</head>
<body>
  <div ss-data="{ 
    value: 0,
    logs: [],
    addLog(msg) {
      this.logs.unshift({ time: new Date().toLocaleTimeString(), msg })
      if (this.logs.length > 10) this.logs.pop()
    }
  }" ss-effect="addLog('Nilai berubah kepada ' + value)">
    <h2>Logger Kesan</h2>
    
    <div>
      <button ss-on:click="value--">-</button>
      <span ss-text="value" style="margin: 0 1rem; font-size: 1.5rem;"></span>
      <button ss-on:click="value++">+</button>
    </div>
    
    <h3>Log Kesan</h3>
    <div class="log">
      <template ss-for="log in logs">
        <div>
          <strong ss-text="log.time"></strong>: <span ss-text="log.msg"></span>
        </div>
      </template>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-data](/ms/directives/ss-data) - Menyediakan data reaktif
- [ss-on](/ms/directives/ss-on) - Kesan sampingan yang dicetuskan peristiwa
