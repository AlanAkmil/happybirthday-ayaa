/* ============================================================
   data.js — semua konten gampang diubah di sini.
   Foto sengaja di-embed sebagai base64 (bukan file terpisah)
   biar GAK ADA LAGI masalah "foto ilang pas upload ke GitHub".
   ============================================================ */

const SITE_DATA = {
  name: "Ayaa",

  orbitLabels: [
    "Ayaa",
    "Amor Eterno",
    "Infinito",
    "Sayangku",
    "Amor Eterno",
    "Untuk Selamanya",
  ],

  // Kode rahasia buat buka page 2 (lock screen).
  // GANTI ini ke tanggal spesial kalian, misal ulang tahun jadian: "1408"
  secretCode: "0000",
  secretHint: "petunjuk: tanggal spesial kalian",

  birthdayTitle: "Happy Birthday, Sayangkuuu",
  birthdayDate: "Selamat Bertambah Usia",

  // Bunga digital — tiap bunga nampilin 1 potongan pesan pas diklik
  bouquet: [
    "Selamat bertambah usia ya sayang 🥹",
    "Kamu bukan cuma orang yang aku sayang, tapi juga tempat aku pulang",
    "Tempat aku cerita, dan alasan hari-hariku terasa lebih berarti",
    "Semoga semua hal baik makin deket ke kamu",
    "Apa yang kamu pengen semoga cepat tercapai, sayang",
    "Makasii ya udah selalu ada buat aku selama ini",
  ],

  letter: `HAPPY BIRTHDAY SAYANGKUUU

Selamat bertambah usia ya sayang, sowryy aku gabisa ngasih kamu hadiah langsung, cuma bisa ngasih ini semoga kamu suka ya baby.

Aku sebenernya gak pandai merangkai kata-kata ahaha, tapi yang jelas aku bersyukur banget bisa kenal kamu sampai sejauh ini sayang. Kamu itu bukan cuma orang yang aku sayang, tapi juga tempat aku pulang, tempat aku cerita, dan alasan kenapa hari-hariku terasa lebih berarti.

Semoga di umur kamu yang sekarang, semua hal baik makin deket ke kamu ya baby. Apa yang kamu pengen semoga cepat tercapai sayang, dan kamu selalu dikelilingi hal-hal yang bisa bikin kamu bahagia.

Makasii ya sayangku, udah selalu ada untuk aku selama ini.

Aku nggak janji semuanya bakal selalu jalan sempurna, tapi aku janji bakal tetap di sini, nemenin kamu, apapun yang terjadi baby.

Happy birthday. I love you, always.`,

  // Our journey — placeholder, tinggal edit sesuai cerita asli kalian
  timeline: [
    { label: "Awal Mula", title: "Pertama Kali Ketemu", desc: "Hari yang gak disangka bakal jadi awal dari semuanya." },
    { label: "Obrolan Pertama", title: "Chat Pertama Kita", desc: "Kata-kata pertama yang berujung jadi ribuan cerita lainnya." },
    { label: "Momen Berharga", title: "Waktu-Waktu Bareng Kamu", desc: "Setiap detik yang dihabiskan bareng, selalu jadi favorit." },
    { label: "Sampai Sekarang", title: "Masih, dan Akan Terus", desc: "Sampai hari ini, dan seterusnya, sayang." },
  ],

  closingMessage: "Aku nggak janji semuanya bakal selalu jalan sempurna, tapi aku janji bakal tetap di sini, nemenin kamu, apapun yang terjadi. I love you, always.",

  // Kuis receh — placeholder, tinggal edit sesuai kalian berdua
  quiz: [
    {
      q: "Pertama kali ketemu kita di mana?",
      options: ["Sekolah", "Media sosial", "Diperkenalkan teman", "Kejadian gak sengaja"],
      correct: 1,
    },
    {
      q: "Makanan favorit aku apa coba?",
      options: ["Pedas-pedas", "Manis-manis", "Yang penting ada kamu", "Semua juga suka"],
      correct: 2,
    },
    {
      q: "Kalo lagi kangen, aku biasanya ngapain?",
      options: ["Diem aja", "Chat kamu duluan", "Nelpon random", "Nulis surat kayak gini"],
      correct: 1,
    },
    {
      q: "Hal yang paling aku suka dari kamu?",
      options: ["Senyumnya", "Cerewetnya", "Semuanya", "Sabarnya"],
      correct: 2,
    },
  ],

  musicSrc: "https://www.image2url.com/r2/default/audio/1782951891615-c1927273-0094-4949-ba44-f788967638e4.mp3",
  musicTitle: "Lagu Spesial Kalian",

  // Foto ada di file terpisah: photos.js (biar upload-nya lebih ringan)
  photos: SITE_PHOTOS,
};


// subset dipakai buat orbit di page 1 (biar gak kepenuhan/berat)
// pake modulo biar gak error walau jumlah foto di photos.js kurang dari 8
SITE_DATA.orbitPhotos = [0, 2, 4, 6, 1, 3, 5, 0].map(
  (i) => SITE_DATA.photos[i % SITE_DATA.photos.length]
);