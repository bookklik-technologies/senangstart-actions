# ss-text

Arahan `ss-text` mengikat kandungan teks elemen kepada ekspresi JavaScript. Kandungan dikemas kini secara automatik apabila data berubah.

## Sintaks

```html
<element ss-text="expression"></element>
```

## Penggunaan Asas

### Pengikatan Sifat Mudah

```html
<div ss-data="{ message: 'Helo, Dunia!' }">
  <p ss-text="message"></p>
</div>
```

**Output:** `Helo, Dunia!`

### Dengan Ekspresi

Anda boleh menggunakan sebarang ekspresi JavaScript yang sah:

```html
<div ss-data="{ count: 5 }">
  <p ss-text="count * 2"></p>        <!-- Output: 10 -->
  <p ss-text="count > 3"></p>        <!-- Output: true -->
  <p ss-text="Math.pow(count, 2)"></p> <!-- Output: 25 -->
</div>
```

### Penggabungan String

```html
<div ss-data="{ firstName: 'Ahmad', lastName: 'Ali' }">
  <p ss-text="'Selamat datang, ' + firstName + ' ' + lastName + '!'"></p>
</div>
```

**Output:** `Selamat datang, Ahmad Ali!`

### Teks Bersyarat

```html
<div ss-data="{ isLoggedIn: true, username: 'Admin' }">
  <p ss-text="isLoggedIn ? 'Selamat kembali, ' + username : 'Sila log masuk'"></p>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-text</title>
</head>
<body>
  <div ss-data="{ 
    visitors: 1234,
    sales: 567,
    revenue: 12345.67
  }">
    <div>
      <p>Pelawat: <span ss-text="visitors.toLocaleString()"></span></p>
      <p>Jualan: <span ss-text="sales"></span></p>
      <p>Pendapatan: RM<span ss-text="revenue.toFixed(2)"></span></p>
    </div>
    
    <button ss-on:click="visitors += Math.floor(Math.random() * 100)">
      Tambah Pelawat
    </button>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-data](/ms/directives/ss-data) - Tentukan sumber data
- [ss-bind](/ms/directives/ss-bind) - Ikat kepada atribut
- [ss-show](/ms/directives/ss-show) - Tunjuk/sembunyi elemen secara bersyarat
