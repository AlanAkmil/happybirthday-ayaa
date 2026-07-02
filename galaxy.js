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
  const FINAL_Z = 44;
  camera.position.set(0, 0, 9);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const controls = {
    enabled: false,
    azimuth: 0,
    polar: Math.PI / 2,
    minAzimuth: -0.7,
    maxAzimuth: 0.7,
    minPolar: Math.PI / 2 - 0.5,
    maxPolar: Math.PI / 2 + 0.5,
    radius: FINAL_Z,
    autoDrift: 0.06,
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
    const dx = (x - lastX) * 0.005;
    const dy = (y - lastY) * 0.005;
    lastX = x;
    lastY = y;
    controls.azimuth = Math.min(controls.maxAzimuth, Math.max(controls.minAzimuth, controls.azimuth + dx));
    controls.polar = Math.min(controls.maxPolar, Math.max(controls.minPolar, controls.polar + dy));
  }
  function dragEnd() {
    dragging = false;
  }

  renderer.domElement.addEventListener("mousedown", (e) => dragStart(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => dragMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", dragEnd);
  renderer.domElement.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length) dragStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );
  renderer.domElement.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length) dragMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );
  renderer.domElement.addEventListener("touchend", dragEnd);

  function updateControls(t) {
    if (!controls.enabled) return;
    const drift = dragging ? 0 : Math.sin(t * 0.15) * controls.autoDrift;
    const az = controls.azimuth + drift;
    const x = controls.radius * Math.sin(controls.polar) * Math.sin(az);
    const z = controls.radius * Math.sin(controls.polar) * Math.cos(az);
    const y = controls.radius * Math.cos(controls.polar) * -1 + controls.radius * Math.cos(Math.PI / 2);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }

  function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return { x, y };
  }

  const HEART_COUNT = 9000;
  const heartPositions = new Float32Array(HEART_COUNT * 3);
  const heartColors = new Float32Array(HEART_COUNT * 3);

  const colorCore = new THREE.Color(0xffffff);
  const colorMid = new THREE.Color(0xff2d55);
  const colorEdge = new THREE.Color(0x8a0f2a);

  for (let i = 0; i < HEART_COUNT; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = heartPoint(t);
    const fill = Math.pow(Math.random(), 0.45);
    const fuzz = (Math.random() - 0.5) * 1.6;
    const scale = 0.62;

    const x = (p.x * fill + fuzz) * scale;
    const y = (p.y * fill + fuzz) * scale + 1.5;
    const z = (Math.random() - 0.5) * 3.2 * (1 - fill * 0.5);

    heartPositions[i * 3] = x;
    heartPositions[i * 3 + 1] = y;
    heartPositions[i * 3 + 2] = z;

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
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const heartPoints = new THREE.Points(heartGeo, heartMat);
  heartPoints.material.opacity = 0;
  scene.add(heartPoints);

  const VORTEX_COUNT = 11000;
  const vortexPositions = new Float32Array(VORTEX_COUNT * 3);
  const vortexColors = new Float32Array(VORTEX_COUNT * 3);
  const vortexColCore = new THREE.Color(0xffffff);
  const vortexColMid = new THREE.Color(0xffd27a);
  const vortexColEdge = new THREE.Color(0xff2d55);
  const vortexColFar = new THREE.Color(0x4b1a6b);

  const ARMS = 3;
  const TWISTS = 2.4;
  const INNER_R = 2.2;
  const OUTER_R = 18;

  for (let i = 0; i < VORTEX_COUNT; i++) {
    const arm = i % ARMS;
    const t = Math.random();
    const radius = INNER_R + t * (OUTER_R - INNER_R);
    const spiralAngle =
      (arm / ARMS) * Math.PI * 2 +
      t * TWISTS * Math.PI * 2 +
      (Math.random() - 0.5) * 0.45;
    const x = Math.cos(spiralAngle) * radius;
    const z = Math.sin(spiralAngle) * radius * 0.42;
    const y = -8 + (Math.random() - 0.5) * 0.7;

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
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const vortexPoints = new THREE.Points(vortexGeo, vortexMat);
  vortexPoints.material.opacity = 0;
  scene.add(vortexPoints);

  const SPARK_COUNT = 4000;
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkColors = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = INNER_R + Math.random() * (OUTER_R - INNER_R);
    sparkPositions[i * 3] = Math.cos(angle) * radius;
    sparkPositions[i * 3 + 1] = -8 + (Math.random() - 0.5) * 1.4;
    sparkPositions[i * 3 + 2] = Math.sin(angle) * radius * 0.42;
    const c = vortexColMid.clone().lerp(vortexColEdge, Math.random());
    sparkColors[i * 3] = c.r;
    sparkColors[i * 3 + 1] = c.g;
    sparkColors[i * 3 + 2] = c.b;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  sparkPoints.material.opacity = 0;
  scene.add(sparkPoints);

  const STAR_COUNT = 7000;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 40 + Math.random() * 220;
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
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  scene.add(starPoints);

  const NEAR_STAR_COUNT = 900;
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
    color: 0xffe8d0,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nearStarPoints = new THREE.Points(nearStarGeo, nearStarMat);
  scene.add(nearStarPoints);

  const DUST_COUNT = 1800;
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
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  const clock = new THREE.Clock();
  let introDone = false;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    heartPoints.rotation.y = Math.sin(t * 0.15) * 0.35;
    heartPoints.position.y = 1.5 + Math.sin(t * 1.1) * 0.35;
    const beat = 1 + Math.sin(t * 2.6) * 0.02;
    heartPoints.scale.set(beat, beat, beat);

    vortexPoints.rotation.y = t * 0.18;
    sparkPoints.rotation.y = -t * 0.3;
    nearStarPoints.rotation.y = t * 0.02;
    dustPoints.rotation.y = -t * 0.015;
    starPoints.rotation.y = t * 0.01;

    if (introDone) {
      updateControls(t);
    } else {
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }
  animate();

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function runIntroZoom() {
    const duration = 1700;
    const startZ = camera.position.z;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      camera.position.z = startZ + (FINAL_Z - startZ) * eased;
      camera.position.y = (1 - eased) * 4;
      camera.lookAt(0, 0, 0);

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

  const orbitLayer = document.getElementById("orbitLayer");
  orbitLayer.style.opacity = "0";
  const centerYPercent = 55;

  const orbiters = [];

  SITE_DATA.orbitPhotos.forEach((src, i) => {
    const el = document.createElement("div");
    el.className = "orbit-photo";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "kenangan";
    el.appendChild(img);
    orbitLayer.appendChild(el);

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
      const depth = Math.sin(angle);
      const scale = o.baseScale * (0.7 + (depth + 1) * 0.22);
      const opacity = 0.45 + (depth + 1) * 0.275;
      const z = Math.round(depth * 10);

      o.el.style.transform = `translate(-50%, calc(-50% + ${centerYPercent - 50}vh)) translate(${x}px, ${y}px) scale(${scale})`;
      o.el.style.opacity = opacity.toFixed(2);
      o.el.style.zIndex = z;
    });
  }
  animateOrbit();

  const startBtn = document.getElementById("startBtn");
  const flash = document.getElementById("flash");
  let transitioning = false;

  startBtn.addEventListener("click", () => {
    if (transitioning) return;
    transitioning = true;
    flash.classList.add("active");
    
    // ✅ FIX: Tambahkan timeout untuk reset state jika page2 gagal load
    const navigationTimeout = setTimeout(() => {
      transitioning = false; // reset jika gagal/timeout
      flash.classList.remove("active");
      console.warn("Navigasi ke page2.html timeout, tombol bisa diklik lagi");
    }, 2000); // 2 detik timeout
    
    setTimeout(() => {
      clearTimeout(navigationTimeout);
      window.location.href = "page2.html";
    }, 950);
  });
  } catch (err) {
    console.error("galaxy.js gagal jalan penuh, fallback ke page2:", err);
  }
})();