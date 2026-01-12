# $refs

Akses elemen DOM yang telah ditanda dengan arahan `ss-ref`.

## Sintaks

```javascript
$refs.referenceName
```

## Cara Ia Berfungsi

1. Tanda elemen dengan `ss-ref="name"`
2. Akses melalui `$refs.name` dalam ekspresi

```html
<div ss-data="{}">
  <input ss-ref="emailInput" type="email">
  <button ss-on:click="$refs.emailInput.focus()">Fokus Email</button>
</div>
```

## Kes Penggunaan Biasa

### Pengurusan Fokus

```html
<div ss-data="{}">
  <input ss-ref="username" placeholder="Nama pengguna" 
         ss-on:keyup.enter="$refs.password.focus()">
  <input ss-ref="password" type="password" placeholder="Kata laluan"
         ss-on:keyup.enter="$refs.submit.click()">
  <button ss-ref="submit">Log Masuk</button>
</div>
```

### Kawalan Borang

```html
<div ss-data="{}">
  <form ss-ref="myForm">
    <input name="email" type="email" required>
    <button type="submit">Hantar</button>
  </form>
  
  <button ss-on:click="$refs.myForm.reset()">Set Semula Borang</button>
</div>
```

### Kawalan Media

```html
<div ss-data="{ isPlaying: false }">
  <video ss-ref="player" src="video.mp4" width="400"></video>
  
  <button ss-on:click="$refs.player.play(); isPlaying = true">▶ Main</button>
  <button ss-on:click="$refs.player.pause(); isPlaying = false">⏸ Jeda</button>
</div>
```

## Berkaitan

- [Arahan ss-ref](/ms/directives/ss-ref) - Cara menentukan rujukan
- [Sifat $el](/ms/properties/el) - Rujukan kepada elemen semasa
