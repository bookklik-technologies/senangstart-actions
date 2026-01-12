# $el

Rujukan kepada elemen DOM semasa di mana ekspresi dinilai.

## Sintaks

```javascript
$el
$el.property
$el.method()
```

## Cara Ia Berfungsi

Dalam mana-mana ekspresi `ss-*`, `$el` merujuk kepada elemen yang mempunyai atribut tersebut:

```html
<div ss-on:click="console.log($el)">
  <!-- $el adalah div ini -->
</div>
```

## Kes Penggunaan Biasa

### Togol Kelas

```html
<div ss-on:click="$el.classList.toggle('active')">
  Klik untuk togol kelas active
</div>
```

### Perubahan Gaya Inline

```html
<div ss-on:mouseenter="$el.style.backgroundColor = 'yellow'"
     ss-on:mouseleave="$el.style.backgroundColor = ''">
  Hover untuk highlight
</div>
```

### Dapatkan Sifat Elemen

```html
<div ss-data="{ info: '' }">
  <div ss-on:click="info = 'Lebar: ' + $el.offsetWidth + ', Tinggi: ' + $el.offsetHeight"
       style="width: 200px; height: 100px; background: #eee;">
    Klik untuk dapatkan dimensi
  </div>
  <p ss-text="info"></p>
</div>
```

### Buang Sendiri

```html
<div ss-on:click="$el.remove()">
  Klik untuk buang elemen ini
</div>
```

## Berkaitan

- [Sifat $refs](/ms/properties/refs) - Rujukan elemen bernama
- [Sifat $event](/ms/properties/event) - Akses objek peristiwa
