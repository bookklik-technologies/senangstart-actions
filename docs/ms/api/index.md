# Rujukan API

SenangStart Actions mendedahkan objek global `SenangStart` dengan kaedah untuk mendaftarkan komponen, stor, dan menginisialisasi framework.

## Kaedah

| Kaedah | Penerangan |
|--------|------------|
| [data()](/ms/api/data) | Daftarkan komponen data boleh guna semula |
| [store()](/ms/api/store) | Daftarkan stor reaktif global |
| [init()](/ms/api/init) | Inisialisasi pokok DOM secara manual |
| [start()](/ms/api/start) | Mulakan framework |

## Rujukan Pantas

```javascript
// Daftarkan komponen boleh guna semula
SenangStart.data('counter', () => ({
  count: 0,
  increment() { this.count++ }
}))

// Daftarkan stor global
SenangStart.store('user', {
  name: 'Tetamu',
  isLoggedIn: false
})

// Inisialisasi kandungan baru secara manual
SenangStart.init(element)

// Mulakan framework (dipanggil automatik)
SenangStart.start()
```

## Versi

Akses versi semasa:

```javascript
console.log(SenangStart.version) // "0.1.0"
```
