# $id

Sifat sakti `$id` adalah fungsi pembantu yang digunakan bersama `ss-id` untuk menjana pengecam unik berskop untuk atribut kebolehcapaian.

## Penggunaan

```javascript
$id(name, key = null)
```

- **name** (String): Nama skop ID yang diisytiharkan dalam `ss-id`.
- **key** (String, pilihan): Akhiran untuk mencipta ID berkaitan (cth: untuk label, penerangan, ralat).

## Contoh

### Pasangan asas input-label

```html
<div ss-id="['login']">
    <label ss-bind:for="$id('login')">Nama Pengguna</label>
    <input ss-bind:id="$id('login')" type="text">
</div>
```

### Komponen kompleks (ARIA)

```html
<div ss-id="['listbox']">
    <button ss-bind:aria-controls="$id('listbox')" aria-haspopup="true">
        Pilih Item
    </button>
    
    <ul ss-bind:id="$id('listbox')" role="listbox">
        ...
    </ul>
</div>
```

## Berkaitan

- [Arahan: ss-id](/ms/directives/ss-id)
