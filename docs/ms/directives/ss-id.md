# ss-id

Arahan `ss-id` membolehkan anda mengisytiharkan "skop ID" untuk menjana ID yang unik dan boleh diramal dalam komponen. Ini penting untuk ciri-ciri kebolehcapaian seperti `aria-labelledby` dan `aria-describedby` di mana dua elemen perlu merujuk satu sama lain melalui ID yang unik.

## Sintaks

```html
<div ss-id="['input-id', 'other-id']">...</div>
<!-- atau untuk ID tunggal -->
<div ss-id="'single-id'">...</div>
```

## Penggunaan Asas

Apabila anda mengisytiharkan nama ID menggunakan `ss-id`, anda boleh mengakses versi unik ID tersebut menggunakan pembantu sakti `$id('name')` dalam skop elemen itu.

### Contoh Borang

```html
<div ss-data="{}" ss-id="['text-input']">
    <label ss-bind:for="$id('text-input')">Nama Pengguna</label>
    <!-- Menghasilkan: id="text-input-1" (atau akhiran unik serupa) -->
    <input type="text" ss-bind:id="$id('text-input')">
</div>

<!-- Instance lain mendapat ID baru secara automatik -->
<div ss-data="{}" ss-id="['text-input']">
    <label ss-bind:for="$id('text-input')">Emel</label>
    <!-- Menghasilkan: id="text-input-2" -->
    <input type="text" ss-bind:id="$id('text-input')">
</div>
```

## Akhiran Kunci

Anda boleh mencipta ID berkaitan dengan menghantar argumen kedua kepada `$id()`.

```html
<div ss-id="['field']">
    <label ss-bind:for="$id('field')">Kata Laluan</label>
    <input type="password" ss-bind:id="$id('field')" ss-bind:aria-describedby="$id('field', 'error')">
    
    <!-- Menghasilkan: id="field-1-error" -->
    <p ss-bind:id="$id('field', 'error')" class="error">
        Kata laluan mesti sekurang-kurangnya 8 aksara.
    </p>
</div>
```

## Berkaitan

- [Sifat Sakti: $id](/ms/properties/id)
