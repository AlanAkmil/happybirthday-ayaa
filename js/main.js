/* ============================================================
   main.js — page 2 interactions
   ============================================================ */

(function () {
  "use strict";

  // ---------- fill content from data.js ----------
  document.getElementById("pageTitle").textContent = SITE_DATA.birthdayTitle;
  document.getElementById("heroTitle").textContent = SITE_DATA.birthdayTitle;
  document.getElementById("heroDate").textContent = SITE_DATA.birthdayDate;
  document.getElementById("closingName").textContent = SITE_DATA.name;
  document.getElementById("musicTitle").textContent = SITE_DATA.musicTitle;

  // ---------- floating lanterns background ----------
  const field = document.getElementById("lanternField");
  const LANTERN_COUNT = 14;
  for (let i = 0; i < LANTERN_COUNT; i++) {
    const l = document.createElement("div");
    l.className = "lantern";
    l.style.left = Math.random() * 100 + "%";
    const duration = 9 + Math.random() * 8;
    l.style.animationDuration = duration + "s";
    l.style.animationDelay = -Math.random() * duration + "s";
    l.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
    field.appendChild(l);
  }

  // ---------- scroll cue ----------
  document.getElementById("scrollCue").addEventListener("click", () => {
    document.getElementById("giftSection").scrollIntoView({ behavior: "smooth" });
  });

  // ---------- gift box open ----------
  const giftBox = document.getElementById("giftBox");
  const giftHint = document.getElementById("giftHint");
  const revealSections = document.querySelectorAll(".reveal-on-gift");
  let opened = false;

  giftBox.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    giftBox.classList.add("opened");
    giftHint.style.opacity = "0";

    setTimeout(() => {
      revealSections.forEach((s, i) => {
        setTimeout(() => s.classList.add("visible"), i * 150);
      });
      document.getElementById("letterSection").scrollIntoView({ behavior: "smooth" });
      startTypewriter();
    }, 600);
  });

  // ---------- letter typewriter ----------
  let typed = false;
  function startTypewriter() {
    if (typed) return;
    typed = true;
    const el = document.getElementById("letterText");
    const cursor = document.getElementById("letterCursor");
    const text = SITE_DATA.letter;
    let i = 0;

    function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, 28);
      } else {
        cursor.style.display = "none";
      }
    }
    tick();
  }

  // ---------- gallery ----------
  const grid = document.getElementById("galleryGrid");
  SITE_DATA.photos.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.style.setProperty("--tilt", `${(i % 2 === 0 ? -1 : 1) * (2 + (i % 3))}deg`);
    const img = document.createElement("img");
    img.src = src;
    img.alt = "kenangan " + (i + 1);
    img.loading = "lazy";
    item.appendChild(img);
    item.addEventListener("click", () => openLightbox(src));
    grid.appendChild(item);
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add("active");
  }
  lightbox.addEventListener("click", () => lightbox.classList.remove("active"));

  // ---------- music player ----------
  const audio = document.getElementById("audioEl");
  audio.src = SITE_DATA.musicSrc;
  const player = document.getElementById("musicPlayer");
  const toggle = document.getElementById("musicToggle");
  const toast = document.getElementById("toast");
  let playing = false;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  toggle.addEventListener("click", () => {
    if (!playing) {
      audio
        .play()
        .then(() => {
          playing = true;
          player.classList.add("playing");
        })
        .catch(() => {
          showToast("Taruh file lagu di assets/audio/song.mp3 dulu ya, biar musiknya bisa muter.");
        });
    } else {
      audio.pause();
      playing = false;
      player.classList.remove("playing");
    }
  });
})();
