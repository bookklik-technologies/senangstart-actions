# Sifat

SenangStart Actions menyediakan sifat khas yang tersedia dalam sebarang skop `ss-data`. Sifat ini memberi anda akses kepada fungsi berguna tanpa persediaan tambahan.

## Sifat Tersedia

| Sifat | Penerangan |
|-------|------------|
| [$refs](/ms/properties/refs) | Akses elemen melalui rujukan |
| [$store](/ms/properties/store) | Akses stor global |
| [$el](/ms/properties/el) | Rujukan elemen semasa |
| [$event](/ms/properties/event) | Objek peristiwa natif |
| [$dispatch](/ms/properties/dispatch) | Hantar peristiwa tersuai |
| [$id](/ms/properties/id) | Jana ID berskop |

## Rujukan Pantas

```html
<div ss-data="{}">
  <!-- $refs - Akses elemen yang dirujuk -->
  <input ss-ref="myInput">
  <button ss-on:click="$refs.myInput.focus()">Fokus</button>
  
  <!-- $store - Akses stor global -->
  <p ss-text="$store.user.name"></p>
  
  <!-- $el - Elemen semasa -->
  <div ss-on:click="$el.classList.toggle('active')">Klik saya</div>
  
  <!-- $event - Objek peristiwa -->
  <input ss-on:input="console.log($event.target.value)">
  
  <!-- $dispatch - Peristiwa tersuai -->
  <button ss-on:click="$dispatch('notify', { message: 'Helo' })">Hantar</button>
</div>
```
