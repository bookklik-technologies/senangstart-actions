# ss-cloak

Arahan `ss-cloak` menyembunyikan elemen sehingga SenangStart selesai menginisialisasinya. Ini menghalang "flash of unrendered content" (FOUC) di mana pengguna melihat sintaks template sebelum ia diganti dengan data sebenar.

## Sintaks

```html
<element ss-cloak>...</element>
```

## CSS Diperlukan

```html
<style>
  [ss-cloak] { display: none !important; }
</style>
```

::: tip
SenangStart secara automatik menyuntik peraturan CSS ini, tetapi anda juga boleh menambahnya secara manual untuk penyembunyian lebih awal.
:::

## Penggunaan Asas

```html
<style>
  [ss-cloak] { display: none !important; }
</style>

<div ss-cloak ss-data="{ message: 'Helo, Dunia!' }">
  <h1 ss-text="message">Memuatkan...</h1>
</div>
```

Tanpa `ss-cloak`, pengguna mungkin melihat "Memuatkan..." sebelum "Helo, Dunia!" muncul.

## Bila Menggunakan

### Menghalang Flash Template

```html
<!-- Tanpa ss-cloak: Pengguna melihat "{{ name }}" sebentar -->
<span ss-text="name">{{ name }}</span>

<!-- Dengan ss-cloak: Tersembunyi sehingga sedia -->
<span ss-cloak ss-text="name">{{ name }}</span>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-cloak</title>
  <style>
    [ss-cloak] { display: none !important; }
    .card { border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div ss-cloak ss-data="{ 
    user: { name: 'Ahmad Ali', role: 'Admin' },
    stats: { posts: 42, followers: 1234 }
  }">
    <div class="card">
      <h2 ss-text="user.name">Memuatkan pengguna...</h2>
      <p ss-text="'Peranan: ' + user.role">Memuatkan peranan...</p>
    </div>
    
    <div class="card">
      <p ss-text="stats.posts + ' kiriman'">-- kiriman</p>
      <p ss-text="stats.followers.toLocaleString() + ' pengikut'">-- pengikut</p>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-data](/ms/directives/ss-data) - Tentukan data komponen
- [ss-text](/ms/directives/ss-text) - Ikat kandungan teks
- [ss-show](/ms/directives/ss-show) - Togol keterlihatan
