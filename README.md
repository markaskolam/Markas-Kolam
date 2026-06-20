# Markas Kolam

Aplikasi web awal untuk bisnis **Markas Kolam**, penjual ikan konsumsi segar. Project ini dibuat dengan Vite, React, dan TypeScript.

## Cara menjalankan project

1. Install dependency:

   ```bash
   npm install
   ```

2. Jalankan mode development:

   ```bash
   npm run dev
   ```

3. Buka URL lokal yang ditampilkan oleh Vite, biasanya `http://localhost:5173`.

## Build production

```bash
npm run build
```

## Cara menambah produk katalog

Data produk disimpan di `src/data/products.ts`. Untuk menambah produk baru, tambahkan object baru ke array `products` dengan struktur berikut:

```ts
{
  id: 'nama-produk-unik',
  name: 'Nama Produk',
  category: 'Ikan',
  description: 'Deskripsi singkat produk.',
  price: 'Hubungi kami untuk harga terbaru',
  whatsappMessage: 'Halo Markas Kolam, saya ingin pesan Nama Produk.',
  useCases: ['Konsumsi', 'Budidaya', 'Ikan hias & koleksi'],
  featured: false,
}
```

Jika ingin menjadikan produk sebagai produk unggulan di halaman utama, set `featured: true` pada produk tersebut.

Gunakan `useCases` untuk menampilkan kegunaan produk di kartu katalog, misalnya untuk konsumsi, budidaya/pembesaran, atau ikan hias/koleksi.

## Nomor WhatsApp

Nomor WhatsApp katalog saat ini berada di konstanta `whatsappNumber` pada `src/data/products.ts`. Ganti nilai placeholder tersebut dengan nomor bisnis resmi Markas Kolam menggunakan format internasional tanpa tanda `+`, misalnya `62812xxxxxxx`.
