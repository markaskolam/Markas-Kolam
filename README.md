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



## Konfigurasi Supabase

Data Supabase diisi di file `.env.local` pada root repository. File ini sengaja masuk `.gitignore`, jadi aman untuk kredensial lokal dan tidak akan ikut ter-commit.

1. Salin template env:

   ```bash
   cp .env.example .env.local
   ```

2. Isi `.env.local` dengan nilai dari dashboard Supabase:

   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
   ```

Aplikasi akan memakai `VITE_SUPABASE_PUBLISHABLE_KEY` sebagai key utama. Jika belum tersedia, aplikasi fallback ke `VITE_SUPABASE_ANON_KEY`.


## Setup akun admin

Akun admin harus dibuat dari Supabase Dashboard atau proses server-side yang memakai service role key, bukan dari frontend publik.

1. Buka **Authentication > Users** di Supabase Dashboard.
2. Buat user baru dengan email `admin@markaskolam.local` dan password awal sesuai kebutuhan.
3. Rotasi password setelah deployment jika password pernah dibagikan lewat chat atau media lain.
4. Jalankan `supabase/schema.sql` agar tabel `admin_profiles` tersedia.
5. Tambahkan profile admin untuk user tersebut lewat SQL Editor Supabase:

   ```sql
   insert into public.admin_profiles (user_id, username, role)
   select id, 'admin', 'admin'
   from auth.users
   where email = 'admin@markaskolam.local'
   on conflict (username) do update
     set user_id = excluded.user_id,
         role = excluded.role;
   ```

6. Login aplikasi memakai username `admin`; frontend hanya memetakan username tersebut ke email Supabase Auth dan tetap memakai `signInWithPassword`.
7. Jangan simpan password admin di source code, `.env`, `localStorage`, atau database custom.

## Struktur halaman

Halaman utama ada di `index.html`. E-Katalog dibuat sebagai halaman terpisah di `ekatalog/index.html`, sehingga bisa diakses lewat path `/ekatalog/`.

Jika nanti menambah fitur atau halaman baru, buat folder dan `index.html` sendiri mengikuti pola tersebut, lalu daftarkan entry HTML-nya di `vite.config.ts` pada `build.rollupOptions.input`.

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
