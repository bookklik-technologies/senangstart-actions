# ss-if

Arahan `ss-if` merender elemen secara bersyarat berdasarkan syarat. Berbeza dengan `ss-show`, ia menambah atau membuang elemen sepenuhnya dari DOM.

## Sintaks

```html
<template ss-if="condition">
  <!-- kandungan untuk dirender apabila syarat adalah true -->
</template>
```

::: warning Penting
`ss-if` mesti digunakan pada elemen `<template>`. Kandungan template akan dirender apabila syarat adalah true.
:::

## Penggunaan Asas

```html
<div ss-data="{ loggedIn: false }">
  <template ss-if="loggedIn">
    <div>Selamat kembali!</div>
  </template>
  
  <template ss-if="!loggedIn">
    <div>Sila log masuk</div>
  </template>
  
  <button ss-on:click="loggedIn = !loggedIn">
    Togol Login
  </button>
</div>
```

## Dengan Ekspresi

```html
<div ss-data="{ role: 'admin' }">
  <template ss-if="role === 'admin'">
    <div>Panel Admin</div>
  </template>
  
  <template ss-if="role === 'user'">
    <div>Dashboard Pengguna</div>
  </template>
  
  <template ss-if="role === 'guest'">
    <div>Paparan Tetamu</div>
  </template>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-if</title>
  <style>
    .step { padding: 1rem; border: 1px solid #ddd; margin: 1rem 0; }
  </style>
</head>
<body>
  <div ss-data="{ currentStep: 1, maxSteps: 3 }">
    <div>
      <button ss-on:click="currentStep = Math.max(1, currentStep - 1)" 
              ss-bind:disabled="currentStep === 1">
        Sebelum
      </button>
      <span ss-text="`Langkah ${currentStep} daripada ${maxSteps}`"></span>
      <button ss-on:click="currentStep = Math.min(maxSteps, currentStep + 1)"
              ss-bind:disabled="currentStep === maxSteps">
        Seterusnya
      </button>
    </div>
    
    <template ss-if="currentStep === 1">
      <div class="step">
        <h2>Langkah 1: Maklumat Peribadi</h2>
        <input placeholder="Nama anda">
      </div>
    </template>
    
    <template ss-if="currentStep === 2">
      <div class="step">
        <h2>Langkah 2: Hubungi</h2>
        <input placeholder="Emel anda">
      </div>
    </template>
    
    <template ss-if="currentStep === 3">
      <div class="step">
        <h2>Langkah 3: Sahkan</h2>
        <p>Semak maklumat anda</p>
        <button>Hantar</button>
      </div>
    </template>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-show](/ms/directives/ss-show) - Togol keterlihatan tanpa membuang dari DOM
- [ss-for](/ms/directives/ss-for) - Render senarai secara bersyarat
- [ss-data](/ms/directives/ss-data) - Sediakan data untuk syarat
