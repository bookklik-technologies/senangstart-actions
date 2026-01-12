# $event

Akses objek peristiwa DOM natif dalam pengendali peristiwa.

## Sintaks

```javascript
$event
$event.property
$event.method()
```

## Cara Ia Berfungsi

Dalam pengendali `ss-on:*`, `$event` mengandungi peristiwa DOM natif:

```html
<button ss-on:click="console.log($event)">
  <!-- $event adalah MouseEvent -->
</button>
```

## Sifat Biasa

### Peristiwa Tetikus

```html
<div ss-data="{ x: 0, y: 0 }">
  <div ss-on:mousemove="x = $event.clientX; y = $event.clientY"
       style="height: 200px; background: #eee;">
    Gerakkan tetikus di sini
  </div>
  <p ss-text="'Posisi: ' + x + ', ' + y"></p>
</div>
```

### Peristiwa Papan Kekunci

```html
<div ss-data="{ lastKey: '' }">
  <input ss-on:keydown="lastKey = $event.key"
         placeholder="Tekan sebarang kekunci">
  <p ss-text="'Kekunci terakhir: ' + lastKey"></p>
</div>
```

### Peristiwa Borang

```html
<div ss-data="{ value: '' }">
  <input ss-on:input="value = $event.target.value">
  <p ss-text="'Nilai: ' + value"></p>
</div>
```

## Kaedah Peristiwa

### preventDefault()

Hentikan tingkah laku lalai pelayar:

```html
<form ss-on:submit="$event.preventDefault(); handleSubmit()">
  <button type="submit">Hantar</button>
</form>
```

::: tip
Gunakan modifier `.prevent` sebagai alternatif: `ss-on:submit.prevent="handleSubmit()"`
:::

## Berkaitan

- [Arahan ss-on](/ms/directives/ss-on) - Pengendalian peristiwa
- [Sifat $el](/ms/properties/el) - Elemen semasa
- [Sifat $dispatch](/ms/properties/dispatch) - Peristiwa tersuai
