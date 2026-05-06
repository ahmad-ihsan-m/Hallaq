# ✂ Hallaq — Barbershop Booking Platform

Platform booking barbershop berbasis web yang dibangun dengan **Next.js**, **Supabase**, dan **Tailwind CSS**.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| Language | JavaScript (ES6+) |
| Styling | Tailwind CSS v3 |
| Database | PostgreSQL via Supabase |

---

## Fitur Utama

- **Autentikasi** — signup/login dengan role: `customer` atau `owner`
- **Halaman Utama** — daftar semua barbershop
- **Detail Barbershop** — list barber, layanan & harga, ulasan
- **Booking** — pilih barber, layanan, tanggal & waktu
- **Dashboard Owner** — tambah barbershop, kelola barber & layanan, konfirmasi booking
- **Database real** — Supabase PostgreSQL dengan 6 tabel relasional

---

## Struktur Folder

```
hallaq/
├── app/
│   ├── layout.js              # Root layout + Navbar
│   ├── page.js                # Home — daftar barbershop
│   ├── auth/
│   │   ├── login/page.js      # Halaman login
│   │   └── signup/page.js     # Halaman daftar
│   ├── barbershops/
│   │   └── [id]/page.js       # Detail barbershop
│   ├── booking/
│   │   └── [barbershopId]/    # Form booking
│   └── dashboard/page.js      # Dashboard owner
├── components/
│   ├── Navbar.js
│   ├── BarbershopCard.js
│   ├── BarberCard.js
│   ├── BookingForm.js
│   └── ReviewCard.js
├── lib/
│   └── supabase.js            # Supabase client
├── services/
│   ├── authService.js
│   ├── barbershopService.js
│   ├── bookingService.js
│   └── reviewService.js
├── supabase/
│   └── schema.sql             # SQL migration + seed data
└── .env.local.example
```

---

## Setup Lokal

### 1. Clone Repository

```bash
git clone https://github.com/username/hallaq.git
cd hallaq
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat Proyek Supabase

1. Buka [https://app.supabase.com](https://app.supabase.com)
2. Klik **New Project** → isi nama, password database, pilih region terdekat
3. Tunggu beberapa menit hingga proyek siap

### 4. Konfigurasi Environment Variables

```bash
cp .env.local.example .env.local
```

Buka `.env.local` dan isi dengan nilai dari Supabase:

- Buka proyek Supabase → **Settings** → **API**
- Salin **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Salin **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Jalankan SQL Schema di Supabase

1. Buka proyek Supabase → **SQL Editor** → **New Query**
2. Copy seluruh isi file `supabase/schema.sql`
3. Paste dan klik **Run** (▶)
4. Pastikan semua query berhasil (tidak ada error merah)

> **Catatan Seed Data:** Uncomment bagian INSERT di akhir `schema.sql` setelah kamu mendaftarkan minimal satu user owner via aplikasi. Ganti `OWNER_UUID` dengan UUID user yang ada di **Authentication → Users**.

### 6. Konfigurasi Email Supabase (Opsional untuk Development)

Agar bisa login tanpa verifikasi email:

- Supabase → **Authentication** → **Providers** → **Email**
- Disable **Confirm email** (untuk development)

### 7. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Alur Penggunaan

### Sebagai Owner:
1. Daftar di `/auth/signup` → pilih **Pemilik Barbershop**
2. Login → klik **Dashboard**
3. Tambah barbershop, barber, dan layanan
4. Pantau dan konfirmasi booking di tab **Booking**

### Sebagai Customer:
1. Daftar di `/auth/signup` → pilih **Pelanggan**
2. Browse barbershop di halaman utama
3. Klik barbershop → **Booking Sekarang**
4. Pilih barber, layanan, tanggal & waktu → konfirmasi

---

## Database Schema

```
users          ─── barbershops ─── barbers
     │                              │
     └── bookings ──────────────────┘
     │       └── services ──────────┤
     │                              │
     └── reviews ──────────────────┘
```

### Tabel

| Tabel | Deskripsi |
|---|---|
| `users` | Data pengguna (extends Supabase Auth) |
| `barbershops` | Data barbershop milik owner |
| `barbers` | Barber yang bekerja di barbershop |
| `services` | Layanan & harga per barbershop |
| `bookings` | Riwayat booking pelanggan |
| `reviews` | Ulasan & rating untuk barber |

---

## Build untuk Production

```bash
npm run build
npm start
```

---

## Proyek ini dibuat sebagai Laporan Kerja Praktik (LKP)

Stack: Next.js 14 + Supabase + Tailwind CSS + JavaScript
