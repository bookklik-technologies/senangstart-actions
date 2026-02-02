# ss-init

Arahan `ss-init` menjalankan ungkapan JavaScript apabila elemen dimulakan oleh SenangStart Actions.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-init.min.js"></script>
```

## Sintaks

```html
<div ss-init="expression"></div>
```

## Penggunaan Asas

### Memulakan Data

Anda boleh menggunakan `ss-init` untuk menetapkan keadaan atau log data apabila komponen dimuatkan:

```html
<div ss-data="{ count: 0 }" ss-init="console.log('Komponen dipasang!')">
  <span ss-text="count"></span>
</div>
```

### Memanggil Kaedah

Ia sering digunakan untuk mencetuskan pengambilan data awal atau kaedah persediaan:

```html
<div ss-data="{ 
  items: [],
  loadItems() {
    this.items = ['Item 1', 'Item 2']
  }
}" ss-init="loadItems()">
  <ul ss-for="item in items">
    <li ss-text="item"></li>
  </ul>
</div>
```

## Arahan Berkaitan

- [ss-effect](/ms/directives/ss-effect) - Jalankan kesan sampingan secara reaktif
