# CLAUDE.md — Instruksi untuk AI Agent (Hallaq Project)

## ⚠️ BACA INI SEBELUM MELAKUKAN PERUBAHAN APAPUN

File ini adalah **batas wewenang** untuk semua AI agent yang bekerja di project ini.
Patuhi aturan di bawah ini secara ketat. Jangan berasumsi — jika ragu, tanya dulu.

---

## ✅ BOLEH DIUBAH — Frontend Only

Kamu **hanya diizinkan** menyentuh file-file berikut:

### Halaman (Pages)
```
app/page.js
app/auth/login/page.js
app/auth/signup/page.js
app/barbershops/[id]/page.js
app/booking/[barbershopId]/page.js
app/booking/[barbershopId]/BookingFormWrapper.js
app/dashboard/page.js
app/layout.js
app/globals.css
```

### Komponen (Components)
```
components/Navbar.js
components/BarbershopCard.js
components/BarberCard.js
components/BookingForm.js
components/ReviewCard.js
components/TimeSlotPicker.js
components/AIHairCheck.js
```

### Styling
```
tailwind.config.js        ← hanya bagian theme/colors
app/globals.css
```

### Yang boleh kamu lakukan di area frontend:
- Mengubah tampilan UI (warna, layout, spacing, teks)
- Menambah komponen visual baru di `components/`
- Memperbaiki bug tampilan
- Menambah state / interaksi di Client Component
- Mengubah copy/teks yang ditampilkan ke user
- Menambah halaman baru di `app/` yang hanya membaca data

---

## ❌ DILARANG KERAS — Backend & System

Kamu **TIDAK BOLEH** menyentuh file-file berikut dalam kondisi apapun:

### Database & Supabase
```
supabase/schema.sql               ← JANGAN UBAH
supabase/migration_timeslots.sql  ← JANGAN UBAH
lib/supabase.js                   ← JANGAN UBAH
```

### Service Layer (Business Logic)
```
services/authService.js           ← JANGAN UBAH
services/barbershopService.js     ← JANGAN UBAH
services/bookingService.js        ← JANGAN UBAH
services/reviewService.js         ← JANGAN UBAH
```

### API Routes
```
app/api/analyze-face/route.js     ← JANGAN UBAH
```

### Konfigurasi System
```
next.config.js                    ← JANGAN UBAH
package.json                      ← JANGAN UBAH
package-lock.json                 ← JANGAN UBAH
jsconfig.json                     ← JANGAN UBAH
postcss.config.js                 ← JANGAN UBAH
.env.local                        ← JANGAN SENTUH SAMA SEKALI
.env.local.example                ← JANGAN UBAH
.gitignore                        ← JANGAN UBAH
```

### Yang tidak boleh kamu lakukan:
- Mengubah query Supabase di services/
- Menambah/menghapus kolom database
- Mengubah struktur tabel SQL
- Memodifikasi API routes
- Menginstall atau menghapus package npm
- Mengubah environment variables
- Mengubah logika autentikasi
- Mengubah logika booking / validasi slot
- Menyentuh file `lib/` atau `services/` dengan alasan apapun

---

## 🔒 Alasan Pembatasan Ini

| Area | Status | Alasan |
|------|--------|--------|
| Database schema | TERKUNCI | Sudah di-deploy ke Supabase, perubahan bisa merusak data production |
| Service functions | TERKUNCI | Sudah diuji dan ada di production, ada validasi booking dan auth |
| API routes | TERKUNCI | Terhubung ke Gemini API dan Supabase, perubahan bisa mematikan fitur |
| Environment variables | TERKUNCI | Berisi API key dan credentials sensitif |
| npm packages | TERKUNCI | Perubahan dependencies butuh review dan testing manual |

---

## 📐 Arsitektur Project (Referensi)

```
Hallaq/
├── app/                    ← ✅ FRONTEND (boleh diubah)
│   ├── page.js
│   ├── layout.js
│   ├── globals.css
│   ├── auth/
│   ├── barbershops/
│   ├── booking/
│   ├── dashboard/
│   └── api/                ← ❌ BACKEND (dilarang)
│       └── analyze-face/
├── components/             ← ✅ FRONTEND (boleh diubah)
├── lib/                    ← ❌ BACKEND (dilarang)
│   └── supabase.js
├── services/               ← ❌ BACKEND (dilarang)
│   ├── authService.js
│   ├── barbershopService.js
│   ├── bookingService.js
│   └── reviewService.js
└── supabase/               ← ❌ DATABASE (dilarang)
    ├── schema.sql
    └── migration_timeslots.sql
```

---

## 🤝 Cara Kerja yang Benar

### Kalau kamu perlu data baru dari backend:
❌ JANGAN ubah `services/` sendiri
✅ Tanya dulu ke developer/owner: "Apakah fungsi X sudah ada di services?"

### Kalau ada bug di tampilan:
✅ Fix di `components/` atau `app/` — aman

### Kalau ada bug di query database:
❌ JANGAN fix sendiri
✅ Laporkan saja: "Ada bug di fungsi Y di services/bookingService.js"

### Kalau perlu install package baru untuk UI:
❌ JANGAN jalankan `npm install` sendiri
✅ Tanya dulu: "Bolehkah install package X untuk keperluan tampilan?"

---

## ✏️ Ringkasan Satu Kalimat

> **Ubah tampilan, bukan logika. Sentuh `app/` dan `components/`, jangan sentuh `lib/`, `services/`, `supabase/`, dan `api/`.**
