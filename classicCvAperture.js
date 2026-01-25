// classicCvAperture.js
// ------------------------------------------------------------
// Substitui o vídeo do quick action "classic cv" por uma animação SVG
// (aperture/iris) dentro do portal #videoShadow.
// - Sem background (transparente).
// - 1 execução: fechado -> abre (a rodar) -> fecha -> pára.
// - Cor por CSS vars (Theme Manager):
//     --aperture-color      (lâminas)
//     --center-text-color   (texto)
// ------------------------------------------------------------

const DEFAULTS = {
  blades: 6,
  durationMs: 3200,
  spinDegTotal: 370,
  outerRadius: 115,

  // Estados densificados (transição mais “mecânica” / suave)
  states: [
    { rIn: 10, w: 0.995, twist: 0.95, shear: 0.62 },
    { rIn: 14, w: 0.985, twist: 0.92, shear: 0.60 },
    { rIn: 18, w: 0.975, twist: 0.89, shear: 0.58 },
    { rIn: 22, w: 0.965, twist: 0.86, shear: 0.56 },
    { rIn: 26, w: 0.955, twist: 0.83, shear: 0.54 },
    { rIn: 30, w: 0.945, twist: 0.80, shear: 0.53 },
    { rIn: 34, w: 0.930, twist: 0.78, shear: 0.52 },
    { rIn: 38, w: 0.915, twist: 0.74, shear: 0.50 },
    { rIn: 42, w: 0.900, twist: 0.70, shear: 0.48 },
    { rIn: 46, w: 0.885, twist: 0.66, shear: 0.46 },
    { rIn: 50, w: 0.870, twist: 0.62, shear: 0.44 },
    { rIn: 54, w: 0.860, twist: 0.58, shear: 0.42 },
    { rIn: 58, w: 0.845, twist: 0.54, shear: 0.40 },
    { rIn: 62, w: 0.830, twist: 0.50, shear: 0.38 },
    { rIn: 66, w: 0.815, twist: 0.46, shear: 0.36 },
    { rIn: 70, w: 0.800, twist: 0.42, shear: 0.34 },
    { rIn: 74, w: 0.785, twist: 0.38, shear: 0.30 },
    { rIn: 78, w: 0.720, twist: 0.30, shear: 0.22 },
  ]
};

export function initClassicCvAperturePortal({
  videoShadowId = "videoShadow",
  videoElId = "videoShadowVideo",
  centerOverlayId = "centerContentOverlay",
  centerTextId = "centerContentText",
  downloadUrl = "download_files/classic_cv.pdf",
  downloadFilename = "classic_cv.pdf",
  textWhileDownloading = "DOWNLOADING",
  config = {}
} = {}) {
  const cfg = {
    ...DEFAULTS,
    ...config,
    ...(config.states ? { states: config.states } : {})
  };

  const overlay = document.getElementById(videoShadowId);
  const videoEl = document.getElementById(videoElId);
  const centerOverlay = document.getElementById(centerOverlayId);
  const centerText = document.getElementById(centerTextId);

  if (!overlay) {
    console.warn(`[classicCvAperture] #${videoShadowId} não existe.`);
    return { playOnce: async () => { }, stop: () => { } };
  }

  // cria SVG 1x e mantém no DOM
  const svg = ensureSvg(overlay, cfg.blades);
  const group = svg.querySelector("#apertureGroup");
  const blades = Array.from(svg.querySelectorAll("path.classicCvBlade"));

  let rafId = null;
  let isRunning = false;

  function stop() {
    isRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;

    overlay.classList.remove("classic-cv-active");
    if (videoEl) videoEl.style.display = "";

    if (centerOverlay) centerOverlay.classList.remove("visible");
    if (centerText) centerText.textContent = "";
  }

  async function playOnce({ showOverlay, hideOverlay } = {}) {
    stop();

    // 1) mostra overlay
    if (typeof showOverlay === "function") showOverlay();
    else overlay.classList.add("visible");

    // 2) activa modo classic-cv (esconde vídeo, mostra SVG)
    overlay.classList.add("classic-cv-active");
    if (videoEl) {
      videoEl.pause?.();
      videoEl.removeAttribute("src");
      try { videoEl.load(); } catch (_) { }
      videoEl.style.display = "none";
    }

    // 3) texto central
    if (centerText) centerText.textContent = textWhileDownloading;
    if (centerOverlay) centerOverlay.classList.add("visible");

    // 4) download (no gesto do click)

    // 5) animação 1x
    isRunning = true;
    const start = performance.now();

    await new Promise((resolve) => {
      const tick = (now) => {
        if (!isRunning) return resolve();

        const elapsed = now - start;
        const u = clamp01(elapsed / cfg.durationMs); // 0..1
        const openT = easeInOutCubic(pingPong01(u));
        const P = sampleStates(cfg.states, openT);

        const rot = u * cfg.spinDegTotal;
        group.setAttribute("transform", `rotate(${rot.toFixed(3)})`);

        for (let i = 0; i < blades.length; i++) {
          blades[i].setAttribute("d", bladePath(i, blades.length, cfg.outerRadius, P));
        }

        if (u >= 1) return resolve();
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    });

    isRunning = false;

    // 6) fechar UI
    setTimeout(() => {
      if (typeof hideOverlay === "function") hideOverlay();
      else overlay.classList.remove("visible");

      overlay.classList.remove("classic-cv-active");

      if (centerOverlay) centerOverlay.classList.remove("visible");
      if (centerText) centerText.textContent = "";

      if (videoEl) videoEl.style.display = "";
    }, 150);
  }

  return { playOnce, stop };
}

// ---------- SVG creation ----------
function ensureSvg(containerEl, bladesCount = 6) {
  let svg = containerEl.querySelector("svg.classicCvApertureSvg");
  if (svg) return svg;

  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "classicCvApertureSvg");
  svg.setAttribute("viewBox", "-120 -120 240 240");
  svg.setAttribute("aria-label", "Classic CV aperture");

  // --- defs: gradient (required) ---
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", "apertureGradient");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "100%");

  const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s1.setAttribute("offset", "0%");
  s1.setAttribute("stop-color", "var(--aperture-grad-a)");

  const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s2.setAttribute("offset", "100%");
  s2.setAttribute("stop-color", "var(--aperture-grad-b)");

  grad.appendChild(s1);
  grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  // --- group that rotates ---
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("id", "apertureGroup");
  svg.appendChild(g);

  // --- blade style uses gradient (fallback to solid if needed) ---
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    .classicCvBlade{ fill: url(#apertureGradient); }
    /* fallback if a browser fails to resolve CSS vars inside SVG stops */
    .classicCvBlade.fallbackSolid{ fill: var(--aperture-color); }
  `;
  svg.appendChild(style);

  for (let i = 0; i < bladesCount; i++) {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("class", "classicCvBlade");
    g.appendChild(p);
  }

  containerEl.appendChild(svg);
  return svg;
}


// ---------- Geometry helpers ----------
function bladePath(i, N, rOut, P) {
  const TAU = Math.PI * 2;
  const step = TAU / N;
  const base = i * step;

  const wAng = step * P.w;
  const twist = step * P.twist;
  const shear = step * P.shear;

  const rIn = P.rIn;

  const a1 = base - wAng / 2 + twist;
  const a2 = base + wAng / 2 + twist;
  const b1 = a1 + shear;
  const b2 = a2 + shear;

  const p1 = polar(rOut, a1);
  const p2 = polar(rOut, a2);
  const p3 = polar(rIn, b2);
  const p4 = polar(rIn, b1);

  const laf = 0;
  const sfOuter = 1;
  const sfInner = 0;

  return [
    `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
    `A ${rOut.toFixed(3)} ${rOut.toFixed(3)} 0 ${laf} ${sfOuter} ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`,
    `L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`,
    `A ${rIn.toFixed(3)} ${rIn.toFixed(3)} 0 ${laf} ${sfInner} ${p4.x.toFixed(3)} ${p4.y.toFixed(3)}`,
    "Z"
  ].join(" ");
}

function sampleStates(states, t) {
  const S = states;
  const a = Math.min(0.999999, Math.max(0, t));
  const max = S.length - 1;
  const seg = Math.min(max - 1, Math.floor(a * max));
  const local = a * max - seg;
  const e = easeInOutCubic(local);

  const A = S[seg];
  const B = S[seg + 1];

  return {
    rIn: lerp(A.rIn, B.rIn, e),
    w: lerp(A.w, B.w, e),
    twist: lerp(A.twist, B.twist, e),
    shear: lerp(A.shear, B.shear, e)
  };
}

function polar(r, a) { return { x: r * Math.cos(a), y: r * Math.sin(a) }; }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function pingPong01(u) { return u <= 0.5 ? u * 2 : 1 - (u - 0.5) * 2; }
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

async function triggerDownload(url, filename) {
  // Must be called directly from the click handler chain to avoid popup-blockers.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename || "";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();

  // cleanup
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

