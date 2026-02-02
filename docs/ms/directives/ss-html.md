# ss-html

Arahan `ss-html` mengemas kini `innerHTML` elemen berdasarkan ungkapan yang dinilai.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-html.min.js"></script>
```

## Sintaks

```html
<div ss-html="expression"></div>
```

## Penggunaan Asas

### Memaparkan Kandungan HTML

Berikan rentetan yang mengandungi HTML:

```html
<div ss-data="{ content: '<strong>Hello Dunia</strong>' }">
  <div ss-html="content"></div>
</div>
```

Ini akan memaparkan:

```html
<div><strong>Hello Dunia</strong></div>
```

> [!WARNING]
> Memaparkan HTML secara dinamik boleh berbahaya dan membawa kepada kerentanan XSS. Hanya gunakan `ss-html` pada kandungan yang dipercayai dan jangan sekali-kali pada input yang diberikan pengguna tanpa pembersihan.

## Arahan Berkaitan

- [ss-text](/ms/directives/ss-text) - Kemas kini kandungan teks
