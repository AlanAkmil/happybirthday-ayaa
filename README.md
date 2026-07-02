# 🌌 Galaxy Love — Website Ucapan Ulang Tahun Digital

Website ucapan ulang tahun interaktif dengan tema **galaksi 3D**, lengkap dengan mini-games, surat digital, galeri foto, dan musik latar. Dibuat khusus buat kamu yang mau ngasih kejutan digital yang beda dari template pasaran.

> 💰 **Harga: Rp 40.000** (sekali bayar, fully custom sesuai data kamu — nama, foto, cerita, lagu, kode rahasia)

---

## ✨ Kenapa ini beda dari template kado digital biasa?

Kebanyakan "kado digital" di pasaran cuma slideshow foto + musik + surat. Website ini punya **scene 3D interaktif** yang dirender langsung di browser (bukan video/gif), lengkap dengan sistem kamera yang bisa diputar 360°, mini-games custom, dan animasi yang di-build dari nol — bukan copy-paste template CodePen.

---

## 🖥️ Fitur Lengkap

### Halaman 1 — Galaxy Love (intro)
- **Kartu pembuka** dengan GIF lucu + tombol "MULAI" sebagai gerbang masuk
- **Scene galaksi 3D** berisi:
  - Partikel berbentuk hati (16.000 titik) yang "berdetak" (efek heartbeat)
  - Piringan spiral/vortex ala black hole (20.000 partikel, 3 lengan spiral)
  - Starfield 2 layer (bintang jauh + bintang dekat yang terasa "lewat" saat zoom)
  - Debu nebula + 4 awan nebula warna-warni yang selalu menghadap kamera (billboard sprite)
- **Kontrol kamera full 360°** — bisa di-drag ke segala arah (mouse & touch)
- **Zoom in/out** — scroll wheel di desktop, pinch dua jari di HP
- **Foto yang mengorbit** di sekitar hati — bisa **diklik/ditap untuk preview besar** (lightbox)
- **Label teks yang beterbangan** di sekitar galaksi (nama, ucapan sayang, ucapan ulang tahun — bisa diisi bebas)
- **Transisi supernova** (efek flash cahaya) saat pindah ke halaman utama

### Halaman 2 — Isi Kado
1. **Lock screen kode rahasia** — pakai PIN pad custom, kode & hint-nya bisa diganti (misal tanggal jadian)
2. **Lentera terbang** — background animasi lentera melayang sepanjang halaman
3. **Kado interaktif** — kotak kado yang bisa ditap/diklik untuk dibuka, memicu semua section berikutnya muncul
4. **Buket bunga digital** — tiap bunga yang di-tap nampilin satu potongan pesan berbeda
5. **Surat cinta dengan efek mesin ketik** (typewriter animation), teks bisa custom sepanjang apapun
6. **Timeline perjalanan** — linimasa cerita kalian (dari pertama ketemu sampai sekarang), fully custom
7. **Galeri foto** dalam bentuk **stack kartu yang bisa di-swipe/drag** (kayak Tinder card), mendukung hingga 16 foto
8. **3 Mini-Games**:
   - 💌 **Kuis Receh** — kuis pilihan ganda seputar "seberapa kenal kamu sama aku", soal & jawaban full custom
   - 🧠 **Cari Pasangan** — memory game mencocokkan kartu hati
   - 💕 **Tangkap Cinta** — mini-game menangkap objek yang jatuh
9. **Pesan penutup** custom
10. **Music player** dengan **autoplay otomatis** (musik langsung nyala begitu halaman dibuka/user pertama kali berinteraksi — nggak perlu pencet tombol manual), bisa play/pause, loop otomatis

### Lain-lain
- **Fully responsive** — dioptimasi buat HP (mayoritas orang buka kado digital dari HP)
- **Foto di-embed base64** — jadi nggak akan pernah "foto ilang" gara-gara masalah hosting/upload
- **Ringan & cepat** — nggak pakai framework berat, load-nya cepat walau isinya animasi 3D

---

## 🛠️ Teknologi yang Dipakai

| Teknologi | Fungsi |
|---|---|
| **HTML5** | Struktur halaman |
| **CSS3** (custom, no framework) | Semua styling, animasi, gradient, responsive layout |
| **JavaScript (Vanilla, ES6+)** | Seluruh logika interaktif — tanpa React/Vue, murni JS biar ringan |
| **Three.js** (r128, via CDN) | Rendering scene galaksi 3D — partikel hati, vortex, starfield, nebula, kamera 3D |
| **WebGL** | Engine rendering grafis di balik Three.js, jalan langsung di GPU browser |
| **Canvas API** | Generate texture glow partikel & awan nebula secara prosedural (bukan file gambar) |
| **CSS Animations & Transitions** | Efek lentera terbang, transisi antar section, hover/tap feedback |
| **Google Fonts** (Great Vibes, Playfair Display, Quicksand) | Tipografi tema romantis/elegan |
| **HTML5 Audio API** | Music player dengan autoplay & fallback interaksi user |
| **Base64 photo embedding** | Foto aman nggak ilang tanpa perlu backend/database |
| **Vercel** (deployment) | Hosting gratis, auto-deploy dari GitHub, custom domain support |

Semua fitur dibangun **dari nol** (custom-coded), bukan template siap pakai yang tinggal edit warna — jadi tiap request perubahan/fitur tambahan bisa disesuaikan.

---

## 📁 Struktur File

```
├── index.html      # Halaman 1 — intro & scene galaksi 3D
├── galaxy.js        # Logic scene 3D (Three.js): kamera, partikel, nebula, lightbox foto
├── galaxy.css        # Styling halaman 1
├── page2.html      # Halaman 2 — isi kado (surat, timeline, games, dst)
├── main.js       # Logic halaman 2: lock screen, gift box, letter, gallery, music
├── main.css       # Styling halaman 2
├── games.js       # 3 mini-games (kuis, memory, catch)
├── data.js        # Semua konten (nama, foto, surat, kuis, dll) — tinggal edit di sini
├── photos.js       # Foto-foto (embedded base64)
└── vercel.json      # Konfigurasi routing untuk deploy di Vercel
```

---

## 💵 Harga & Ketentuan

**Rp 35.000** sudah termasuk:
- Custom nama, foto (hingga 16 foto), surat, timeline cerita, dan lagu
- Custom kode rahasia (PIN) + hint-nya
- Custom soal & jawaban kuis
- Link siap pakai (deploy ke Vercel), bisa dibuka dari HP mana saja tanpa install apapun
- 1x revisi minor (ganti teks/foto/lagu)

*Di luar paket: request fitur baru di luar yang sudah ada, atau custom domain (butuh biaya sewa domain terpisah).*
