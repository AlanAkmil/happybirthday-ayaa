/* ============================================================
   data.js — semua konten yang gampang diubah taruh di sini.
   Alan tinggal ganti isi object ini kalau ada request tambahan
   dari client (nama, tanggal, surat, foto, lagu).
   ============================================================ */

const SITE_DATA = {
  // Nama yang tampil menggantikan "Amor De Mi Vida"
  name: "Ayaa",

  // Label-label yang mengorbit di galaxy heart (page 1)
  orbitLabels: [
    "Ayaa",
    "Amor Eterno",
    "Infinito",
    "Sayangku",
    "Amor Eterno",
    "Untuk Selamanya",
  ],

  // Foto-foto yang mengelilingi heart & dipakai di galeri page 2
  photos: [
    "assets/photos/photo1.jpg",
    "assets/photos/photo2.jpg",
    "assets/photos/photo3.jpg",
    "assets/photos/photo4.jpg",
    "assets/photos/photo5.jpg",
    "assets/photos/photo6.jpg",
    "assets/photos/photo7.jpg",
  ],

  // Judul & tanggal di page 2 — placeholder, tinggal isi
  birthdayTitle: "Happy Birthday, Ayaa",
  birthdayDate: "Tanggal Spesialmu",

  // Surat — placeholder, tinggal ganti isinya
  letter: `Untuk Ayaa,

Ini baru draft surat ya. Nanti tinggal diganti sama kata-kata
asli dari yang mau ngasih kejutan ini. Semua yang tulisan ini
sentuh nantinya bakal jadi pengingat kecil betapa berartinya
kamu buat dia.

Selamat ulang tahun, Ayaa. Semoga hari ini seindah senyummu.`,

  // Path lagu — kosongkan / ganti sesuai file yang dikirim client
  musicSrc: "assets/audio/song.mp3",
  musicTitle: "Lagu Spesial Kalian",
};
