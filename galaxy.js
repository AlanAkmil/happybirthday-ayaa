/* ============================================================
   galaxy.js — particle heart, starfield, orbiting photos & labels
   ============================================================ */

(function () {
  "use strict";

  // ---------- fill in name from data.js ----------
  document.getElementById("loverName").textContent = SITE_DATA.name;

  // ============================================================
  // SAFETY NET: pastikan tombol MULAI selalu jalan, bahkan kalau
  // three.js/CDN gagal load (koneksi lemot dll). Ini didaftarkan
  // PALING AWAL, sebelum kode WebGL yang berat & rawan gagal.
  // ============================================================
  let threeReady = false;
  let fancyStart = null;
  const introBtnEl = document.getElementById("introBtn");
  const introOverlayEl = document.getElementById("introOverlay");
  let introClicked = false;

  introBtnEl.addEventListener("click", () => {
    if (introClicked) return;
    introClicked = true;
    introOverlayEl.classList.add("hidden");
    if (threeReady && fancyStart) {
      fancyStart();
    } else {
      // fallback: three.js belum/gagal siap, langsung lanjut ke page 2
      document.getElementById("hud").classList.add("visible");
      setTimeout(() => {
        window.location.href = "page2.html";
      }, 600);
    }
  });

  try {
  // ---------- renderer / scene / camera ----------
  const canvas = document.getElementById("scene");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const FINAL_Z = 44; // "agak jauhan dikit" biar galaksinya kelihatan luas
  // titik pusat galaksi (tempat si love & spiral duduk) — semua kamera &
  // kontrol drag ngarah/orbit ke titik ini, bukan ke (0,0,0) lagi.
  const TARGET_Y = -8;
  camera.position.set(0, 0, 9); // mulai dekat/di dalam bintang dulu

  // ---------- sprite bulat glowing buat semua partikel ----------
  // Default THREE.PointsMaterial tanpa map = titik KOTAK. Ini generate
  // texture bulat lembut (radial gradient) di canvas, dipakai sebagai
  // `map` di semua PointsMaterial biar hasilnya bulat & bercahaya.
  function makeGlowSprite() {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.7, "rgba(255,255,255,0.25)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  const glowSprite = makeGlowSprite();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------- drag-to-look (custom, no external library needed) ----------
  // Sebelumnya pakai OrbitControls dari CDN luar — kalau koneksi lemot dan
  // script itu gagal ke-load, seluruh galaxy.js ikut berhenti (macet total,
  // termasuk tombol MULAI). Sekarang murni vanilla, gak nunggu CDN lain.
  const controls = {
    enabled: false,
    azimuth: 0,
    // ditilt ke bawah dikit (bukan pas PI/2 = lurus dari samping) biar
    // piringan spiral & love di tengahnya kebaca jelas kayak foto galaksi,
    // gak keliatan gepeng jadi garis doang.
    polar: Math.PI / 2 - 0.78,
    // FULL 360°: azimuth udah gak dibatasi lagi (bebas puter kemana aja).
    // polar tetep dikasih batas dikit biar kamera gak "kebalik" pas
    // ngelewatin kutub atas/bawah (gimbal flip).
    minPolar: 0.18,
    maxPolar: Math.PI - 0.18,
    radius: FINAL_Z,
    minRadius: 12, // paling deket, biar bisa "masuk" ke tengah galaksi
    maxRadius: 95, // paling jauh, biar bisa liat galaksi dari luar + nebula
    autoDrift: 0.06, // ambient sway kecil kalau lagi gak di-drag
  };

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function dragStart(x, y) {
    if (!controls.enabled) return;
    dragging = true;
    lastX = x;
    lastY = y;
  }
  function dragMove(x, y) {
    if (!controls.enabled || !dragging) return;
    const dx = (x - lastX) * 0.006;
    const dy = (y - lastY) * 0.006;
    lastX = x;
    lastY = y;
    // azimuth bebas puter 360°, gak di-clamp lagi
    controls.azimuth += dx;
    controls.polar = Math.min(controls.maxPolar, Math.max(controls.minPolar, controls.polar + dy));
  }
  function dragEnd() {
    dragging = false;
  }
  function zoomBy(delta) {
    if (!controls.enabled) return;
    controls.radius = Math.min(controls.maxRadius, Math.max(controls.minRadius, controls.radius + delta));
  }

  renderer.domElement.addEventListener("mousedown", (e) => dragStart(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => dragMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", dragEnd);

  // scroll wheel = zoom in/out (desktop)
  renderer.domElement.addEventListener(
    "wheel",
    (e) => {
      if (!controls.enabled) return;
      e.preventDefault();
      zoomBy(e.deltaY * 0.03);
    },
    { passive: false }
  );

  // touch: 1 jari = puter kamera 360°, 2 jari (pinch) = zoom
  let pinchStartDist = null;
  let pinchStartRadius = controls.radius;
  function touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
  renderer.domElement.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        dragging = false;
        pinchStartDist = touchDist(e.touches);
        pinchStartRadius = controls.radius;
      } else if (e.touches.length === 1) {
        dragStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );
  renderer.domElement.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 2 && pinchStartDist) {
        const dist = touchDist(e.touches);
        const ratio = pinchStartDist / dist;
        controls.radius = Math.min(
          controls.maxRadius,
          Math.max(controls.minRadius, pinchStartRadius * ratio)
        );
      } else if (e.touches.length === 1) {
        dragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );
  renderer.domElement.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) pinchStartDist = null;
    if (e.touches.length === 0) dragEnd();
  });

  function updateControls(t) {
    if (!controls.enabled) return;
    const drift = dragging ? 0 : Math.sin(t * 0.15) * controls.autoDrift;
    const az = controls.azimuth + drift;
    const x = controls.radius * Math.sin(controls.polar) * Math.sin(az);
    const z = controls.radius * Math.sin(controls.polar) * Math.cos(az);
    const y =
      controls.radius * Math.cos(controls.polar) * -1 +
      controls.radius * Math.cos(Math.PI / 2) +
      TARGET_Y;
    camera.position.set(x, y, z);
    camera.lookAt(0, TARGET_Y, 0);
  }

  // ---------- heart parametric shape ----------
  function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return { x, y };
  }

  // HEART_CENTER_Y = titik love ngambang PAS DI ATAS piringan spiral —
  // sebelumnya kesamaan persis sama TARGET_Y jadi ring-nya kepotong ke
  // TENGAH si love (kayak cincin Saturnus nembus jantung). Sekarang love
  // digeser ke atas biar ring-nya jelas kebaca DI BAWAH love, bukan nembus.
  const HEART_CENTER_Y = TARGET_Y + 12;

  const HEART_COUNT = 16000;
  const heartPositions = new Float32Array(HEART_COUNT * 3);
  const heartColors = new Float32Array(HEART_COUNT * 3);

  const colorCore = new THREE.Color(0xffffff);
  const colorMid = new THREE.Color(0xff2d55);
  const colorEdge = new THREE.Color(0x8a0f2a);

  for (let i = 0; i < HEART_COUNT; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = heartPoint(t);
    // fill volume: shrink toward center with random factor, plus fuzz
    const fill = Math.pow(Math.random(), 0.45); // bias toward edge for fluffy silhouette
    const fuzz = (Math.random() - 0.5) * 1.6;
    const scale = 0.62;

    const x = (p.x * fill + fuzz) * scale;
    const y = (p.y * fill + fuzz) * scale * 0.9 + HEART_CENTER_Y;
    const z = (Math.random() - 0.5) * 3.4 * (1 - fill * 0.5);

    heartPositions[i * 3] = x;
    heartPositions[i * 3 + 1] = y;
    heartPositions[i * 3 + 2] = z;

    // color gradient: core white-pink -> mid crimson -> edge deep red
    const mixed =
      fill > 0.75
        ? colorCore.clone().lerp(colorMid, (1 - fill) * 4)
        : colorMid.clone().lerp(colorEdge, 1 - fill);

    heartColors[i * 3] = mixed.r;
    heartColors[i * 3 + 1] = mixed.g;
    heartColors[i * 3 + 2] = mixed.b;
  }

  const heartGeo = new THREE.BufferGeometry();
  heartGeo.setAttribute("position", new THREE.BufferAttribute(heartPositions, 3));
  heartGeo.setAttribute("color", new THREE.BufferAttribute(heartColors, 3));

  const heartMat = new THREE.PointsMaterial({
    size: 0.22,
    map: glowSprite,
    alphaTest: 0.01,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const heartPoints = new THREE.Points(heartGeo, heartMat);
  // catatan: persamaan parametrik ini SUDAH lurus (lobe di atas, lancip di
  // bawah) selama Y three.js menghadap ke atas — jangan dirotate 180deg lagi,
  // itu penyebab bentuknya kebalik kayak toa/es krim di build sebelumnya.
  heartPoints.material.opacity = 0; // fade in setelah zoom kelar
  scene.add(heartPoints);

  // ---------- spiral vortex / black hole di bawah heart (kayak referensi) ----------
  const VORTEX_COUNT = 20000;
  const vortexPositions = new Float32Array(VORTEX_COUNT * 3);
  const vortexColors = new Float32Array(VORTEX_COUNT * 3);
  const vortexColCore = new THREE.Color(0xffffff);
  const vortexColMid = new THREE.Color(0xffd27a);
  const vortexColEdge = new THREE.Color(0xff2d55);
  const vortexColFar = new THREE.Color(0x4b1a6b);

  const ARMS = 3;
  const TWISTS = 2.4;
  // lubang tengah diperkecil biar spiral-nya nempel & ngelilingin si love,
  // bukan misah kayak sebelumnya (love sekarang duduk pas di titik pusat ini)
  const INNER_R = 1.1;
  const OUTER_R = 19;

  for (let i = 0; i < VORTEX_COUNT; i++) {
    const arm = i % ARMS;
    // t dibikin ngumpul lebih padet deket pusat (pow 1.35) biar makin ke
    // ujung makin jarang/tipis partikelnya = kesan "mengecil" di ujung
    const t = Math.pow(Math.random(), 1.35);
    const radius = INNER_R + t * (OUTER_R - INNER_R);
    // jitter sudut ikut ngecil pas mendekati ujung (t besar) biar lengan
    // spiralnya beneran meruncing, gak ngeblob lebar di ujung
    const armJitter = 0.45 * (1 - t * 0.7);
    const spiralAngle =
      (arm / ARMS) * Math.PI * 2 +
      t * TWISTS * Math.PI * 2 +
      (Math.random() - 0.5) * armJitter;
    const x = Math.cos(spiralAngle) * radius;
    // flatten dikurangin (0.42 -> 0.72) + kamera lebih ke atas biar
    // piringannya kebaca BULAT, bukan oval/lonjong kayak sebelumnya
    const z = Math.sin(spiralAngle) * radius * 0.72;
    const y = TARGET_Y + (Math.random() - 0.5) * 0.7 * (1 - t * 0.5);

    vortexPositions[i * 3] = x;
    vortexPositions[i * 3 + 1] = y;
    vortexPositions[i * 3 + 2] = z;

    let c;
    if (t < 0.15) c = vortexColCore.clone().lerp(vortexColMid, t / 0.15);
    else if (t < 0.55) c = vortexColMid.clone().lerp(vortexColEdge, (t - 0.15) / 0.4);
    else c = vortexColEdge.clone().lerp(vortexColFar, (t - 0.55) / 0.45);

    vortexColors[i * 3] = c.r;
    vortexColors[i * 3 + 1] = c.g;
    vortexColors[i * 3 + 2] = c.b;
  }
  const vortexGeo = new THREE.BufferGeometry();
  vortexGeo.setAttribute("position", new THREE.BufferAttribute(vortexPositions, 3));
  vortexGeo.setAttribute("color", new THREE.BufferAttribute(vortexColors, 3));
  const vortexMat = new THREE.PointsMaterial({
    size: 0.18,
    map: glowSprite,
    alphaTest: 0.01,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const vortexPoints = new THREE.Points(vortexGeo, vortexMat);
  vortexPoints.material.opacity = 0; // fade in setelah zoom kelar
  scene.add(vortexPoints);

  // percikan kecil di tepi vortex biar makin rame (lapisan tambahan)
  const SPARK_COUNT = 7000;
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkColors = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    const t2 = Math.pow(Math.random(), 1.35); // sama, numpuk deket pusat
    const angle = Math.random() * Math.PI * 2;
    const radius = INNER_R + t2 * (OUTER_R - INNER_R);
    sparkPositions[i * 3] = Math.cos(angle) * radius;
    sparkPositions[i * 3 + 1] = TARGET_Y + (Math.random() - 0.5) * 1.4 * (1 - t2 * 0.5);
    sparkPositions[i * 3 + 2] = Math.sin(angle) * radius * 0.72;
    const c = vortexColMid.clone().lerp(vortexColEdge, Math.random());
    sparkColors[i * 3] = c.r;
    sparkColors[i * 3 + 1] = c.g;
    sparkColors[i * 3 + 2] = c.b;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.1,
    map: glowSprite,
    alphaTest: 0.01,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  sparkPoints.material.opacity = 0;
  scene.add(sparkPoints);

  // ---------- starfield background: 2 layer biar rame & nyebar ----------
  const STAR_COUNT = 10000;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 40 + Math.random() * 220; // disebar lebih jauh & lebih variatif
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.35,
    map: glowSprite,
    alphaTest: 0.01,
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  scene.add(starPoints);

  // layer bintang dekat + gede biar berasa "lewat" pas kamera zoom
  const NEAR_STAR_COUNT = 1400;
  const nearStarPositions = new Float32Array(NEAR_STAR_COUNT * 3);
  for (let i = 0; i < NEAR_STAR_COUNT; i++) {
    const r = 15 + Math.random() * 60;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    nearStarPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    nearStarPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    nearStarPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const nearStarGeo = new THREE.BufferGeometry();
  nearStarGeo.setAttribute("position", new THREE.BufferAttribute(nearStarPositions, 3));
  const nearStarMat = new THREE.PointsMaterial({
    size: 0.55,
    map: glowSprite,
    alphaTest: 0.01,
    color: 0xffe8d0,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nearStarPoints = new THREE.Points(nearStarGeo, nearStarMat);
  scene.add(nearStarPoints);

  // debu nebula tipis buat atmosfer, warna ungu-pink lembut
  const DUST_COUNT = 2600;
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustColors = new Float32Array(DUST_COUNT * 3);
  const dustColA = new THREE.Color(0x4b1a6b);
  const dustColB = new THREE.Color(0xff6b86);
  for (let i = 0; i < DUST_COUNT; i++) {
    const r = 20 + Math.random() * 90;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
    dustPositions[i * 3 + 2] = r * Math.cos(phi);
    const c = dustColA.clone().lerp(dustColB, Math.random());
    dustColors[i * 3] = c.r;
    dustColors[i * 3 + 1] = c.g;
    dustColors[i * 3 + 2] = c.b;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.5,
    map: glowSprite,
    alphaTest: 0.01,
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  // ---------- nebula awan besar jauh di kejauhan (dekorasi background) ----------
  // Sprite selalu ngadep kamera (billboard), jadi tetep keliatan "awan"
  // dari sudut manapun kamera diputer — cocok buat kontrol 360°.
  function makeNebulaSprite(colorA, colorB, size, opacity) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, colorA);
    grad.addColorStop(0.45, colorB);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
  }

  const nebulaConfigs = [
    { colorA: "rgba(255,90,140,0.55)", colorB: "rgba(120,20,70,0.25)", size: 140, opacity: 0.35, pos: [-160, 40, -220] },
    { colorA: "rgba(140,90,255,0.5)", colorB: "rgba(60,20,110,0.22)", size: 170, opacity: 0.32, pos: [190, -30, -260] },
    { colorA: "rgba(90,180,255,0.4)", colorB: "rgba(30,60,130,0.2)", size: 130, opacity: 0.28, pos: [-40, -120, -300] },
    { colorA: "rgba(255,180,120,0.4)", colorB: "rgba(140,60,20,0.18)", size: 110, opacity: 0.25, pos: [120, 110, -240] },
  ];
  const nebulaSprites = nebulaConfigs.map((cfg) => {
    const sprite = makeNebulaSprite(cfg.colorA, cfg.colorB, cfg.size, cfg.opacity);
    sprite.position.set(cfg.pos[0], cfg.pos[1] + TARGET_Y, cfg.pos[2]);
    scene.add(sprite);
    return sprite;
  });

  // ---------- animation loop ----------
  const clock = new THREE.Clock();
  let introDone = false;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    heartPoints.rotation.y = Math.sin(t * 0.15) * 0.35;
    heartPoints.position.y = Math.sin(t * 1.1) * 0.35; // gentle heartbeat float
    const beat = 1 + Math.sin(t * 2.6) * 0.02;
    heartPoints.scale.set(beat, beat, beat);

    vortexPoints.rotation.y = t * 0.18;
    sparkPoints.rotation.y = -t * 0.3;
    nearStarPoints.rotation.y = t * 0.02;
    dustPoints.rotation.y = -t * 0.015;
    starPoints.rotation.y = t * 0.01;
    nebulaSprites.forEach((s, i) => {
      s.material.opacity = nebulaConfigs[i].opacity * (0.85 + Math.sin(t * 0.08 + i * 2) * 0.15);
    });

    if (introDone) {
      updateControls(t);
    } else {
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }
  animate();

  // ============================================================
  // Intro sequence: kartu "Galaxy Love" -> zoom keluar dari tengah
  // bintang -> galaksi cinta muncul -> orbit controls aktif
  // ============================================================
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function runIntroZoom() {
    const duration = 1700; // dipercepat sesuai request — tetep smooth tapi gak lama
    const startZ = camera.position.z;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      camera.position.z = startZ + (FINAL_Z - startZ) * eased;
      camera.position.y = (1 - eased) * 4 + eased * TARGET_Y;
      camera.lookAt(0, TARGET_Y * eased, 0);

      // heart & disk fade + scale in di paruh kedua animasi
      const revealProgress = Math.min(Math.max((progress - 0.35) / 0.65, 0), 1);
      const revealEased = easeOutCubic(revealProgress);
      heartMat.opacity = revealEased * 0.95;
      vortexMat.opacity = revealEased * 0.9;
      sparkMat.opacity = revealEased * 0.7;
      orbitLayer.style.opacity = revealEased;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        introDone = true;
        controls.enabled = true;
        document.getElementById("hud").classList.add("visible");
        document.getElementById("startBtn").classList.add("visible");
      }
    }
    requestAnimationFrame(step);
  }

  fancyStart = runIntroZoom;
  threeReady = true;

  // ============================================================
  // DOM orbit layer: photos + love-word labels circling the heart
  // ============================================================
  const orbitLayer = document.getElementById("orbitLayer");
  orbitLayer.style.opacity = "0";
  // kamera sekarang selalu ngeliat pas ke titik tengah love/spiral, jadi
  // posisinya di layar ada persis di tengah (50%), gak perlu digeser lagi
  const centerYPercent = 50;

  const orbiters = [];

  // ---------- lightbox: klik foto orbit buat liat versi gedenya ----------
  const lightbox = document.getElementById("photoLightbox");
  const lightboxImg = document.getElementById("photoLightboxImg");
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add("visible");
  }
  if (lightbox) {
    lightbox.addEventListener("click", () => lightbox.classList.remove("visible"));
  }

  SITE_DATA.orbitPhotos.forEach((src, i) => {
    const el = document.createElement("div");
    el.className = "orbit-photo";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "kenangan";
    el.appendChild(img);
    orbitLayer.appendChild(el);

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openLightbox(src);
    });

    orbiters.push({
      el,
      radiusX: 130 + (i % 3) * 55,
      radiusY: 60 + (i % 3) * 22,
      speed: 0.15 + (i % 4) * 0.05,
      angle: (i / SITE_DATA.orbitPhotos.length) * Math.PI * 2,
      baseScale: 0.85 + (i % 3) * 0.15,
    });
  });

  const labels = SITE_DATA.orbitLabels.filter((l) => l !== SITE_DATA.name);
  labels.forEach((text, i) => {
    const el = document.createElement("div");
    el.className = "orbit-label";
    el.textContent = text;
    orbitLayer.appendChild(el);

    orbiters.push({
      el,
      radiusX: 220 + (i % 3) * 60,
      radiusY: 95 + (i % 3) * 30,
      speed: -(0.08 + (i % 3) * 0.04),
      angle: (i / labels.length) * Math.PI * 2,
      baseScale: 1,
      isLabel: true,
    });
  });

  function animateOrbit() {
    requestAnimationFrame(animateOrbit);
    const t = clock.getElapsedTime();
    orbiters.forEach((o) => {
      const angle = o.angle + t * o.speed;
      const x = Math.cos(angle) * o.radiusX;
      const y = Math.sin(angle) * o.radiusY;
      const depth = Math.sin(angle); // -1 back, 1 front
      const scale = o.baseScale * (0.7 + (depth + 1) * 0.22);
      const opacity = 0.45 + (depth + 1) * 0.275;
      const z = Math.round(depth * 10);

      o.el.style.transform = `translate(-50%, calc(-50% + ${centerYPercent - 50}vh)) translate(${x}px, ${y}px) scale(${scale})`;
      o.el.style.opacity = opacity.toFixed(2);
      o.el.style.zIndex = z;
    });
  }
  animateOrbit();

  // ---------- start button: supernova transition -> page2 ----------
  const startBtn = document.getElementById("startBtn");
  const flash = document.getElementById("flash");
  let transitioning = false;

  startBtn.addEventListener("click", () => {
    if (transitioning) return;
    transitioning = true;
    flash.classList.add("active");
    setTimeout(() => {
      window.location.href = "page2.html";
    }, 950);
  });
  } catch (err) {
    // Kalau ada apapun yang gagal di atas (CDN lemot, WebGL gak didukung,
    // dll), threeReady tetap false sehingga tombol MULAI (safety net di
    // paling atas) langsung lanjut ke page2.html tanpa animasi galaksi.
    console.error("galaxy.js gagal jalan penuh, fallback ke page2:", err);
  }
})();
