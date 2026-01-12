# ss-model

Arahan `ss-model` mencipta pengikatan data dua hala antara elemen borang dan sifat data. Apabila input berubah, data dikemas kini. Apabila data dikemas kini, input mencerminkan perubahan.

## Sintaks

```html
<input ss-model="property">
```

## Elemen Disokong

### Input Teks

```html
<div ss-data="{ name: '' }">
  <input type="text" ss-model="name" placeholder="Masukkan nama">
  <p ss-text="'Helo, ' + (name || 'tetamu')"></p>
</div>
```

### Textarea

```html
<div ss-data="{ message: '' }">
  <textarea ss-model="message" placeholder="Masukkan mesej"></textarea>
  <p ss-text="message.length + ' aksara'"></p>
</div>
```

### Checkbox

```html
<div ss-data="{ agreed: false }">
  <label>
    <input type="checkbox" ss-model="agreed">
    Saya bersetuju dengan terma
  </label>
  <button ss-bind:disabled="!agreed">Teruskan</button>
</div>
```

### Radio

```html
<div ss-data="{ color: 'merah' }">
  <label>
    <input type="radio" ss-model="color" value="merah"> Merah
  </label>
  <label>
    <input type="radio" ss-model="color" value="hijau"> Hijau
  </label>
  <label>
    <input type="radio" ss-model="color" value="biru"> Biru
  </label>
  <p ss-text="'Dipilih: ' + color"></p>
</div>
```

### Select

```html
<div ss-data="{ country: '' }">
  <select ss-model="country">
    <option value="">Pilih negara</option>
    <option value="my">Malaysia</option>
    <option value="sg">Singapura</option>
    <option value="id">Indonesia</option>
  </select>
  <p ss-show="country" ss-text="'Dipilih: ' + country"></p>
</div>
```

## Contoh Langsung

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contoh ss-model</title>
  <style>
    .calculator { max-width: 300px; }
    input, select { width: 100%; padding: 0.5rem; margin: 0.25rem 0; }
  </style>
</head>
<body>
  <div ss-data="{ 
    amount: 100,
    rate: 5,
    years: 1,
    get interest() { return this.amount * (this.rate / 100) * this.years },
    get total() { return this.amount + this.interest }
  }" class="calculator">
    <h2>Kalkulator Faedah</h2>
    
    <label>
      Jumlah Prinsipal (RM)
      <input type="number" ss-model="amount" min="0">
    </label>
    
    <label>
      Kadar Faedah (%)
      <input type="number" ss-model="rate" min="0" max="100" step="0.1">
    </label>
    
    <label>
      Masa (tahun)
      <input type="number" ss-model="years" min="1">
    </label>
    
    <div>
      <p>Faedah: RM<span ss-text="interest.toFixed(2)"></span></p>
      <p>Jumlah: RM<span ss-text="total.toFixed(2)"></span></p>
    </div>
  </div>

  <script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
</body>
</html>
```

## Arahan Berkaitan

- [ss-data](/ms/directives/ss-data) - Tentukan data borang
- [ss-on](/ms/directives/ss-on) - Kendalikan peristiwa borang
- [ss-bind](/ms/directives/ss-bind) - Ikat keadaan pengesahan kepada kelas
