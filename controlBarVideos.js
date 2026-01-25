// controlBarVideos.js
import { SPHERE_CONFIG as CONFIG } from "./sphereConfigControlPanel.js";

// Config geral para timings de vídeo / portal
export const VIDEO_PORTAL_CONFIG = {
  fadeInDurationMs: 500,
  fadeOutDurationMs: 500,
  delayBeforePlayMs: 200,
  delayBeforeHideAfterEndMs: 300
};

// Array que liga os botões (por ordem) aos vídeos
// 👉 Ajusta os paths dos vídeos como quiseres
export const BUTTON_VIDEO_MAP = [
 /*
  {
    label: "in dev... 🔒",
    videoSrc: "videos/in-dev-1.mp4"
  },
  {
    label: "in dev... 🔒",
    videoSrc: "videos/in-dev-2.mp4"
  },  
  */
  {
    label: "me",
    videoSrc: "videos/me.mp4"
  },
  {
    label: "my work",
    videoSrc: "videos/my-work.mp4"
  },
  {
    label: "classic cv",
    videoSrc: "videos/classic-cv.mp4"
  }
];

// initControlBarVideos recebe callbacks:
// - onTriggerPrompt(label): dispara o hollow / prompt (mantém-se)
// - onClassicCv(helpers): executa a tua animação SVG 1x (novo)
export function initControlBarVideos({
  onTriggerPrompt,
  onClassicCv,                 // <-- NOVO
  config = VIDEO_PORTAL_CONFIG
} = {}) {
  const bar = document.getElementById("controlBarInner");
  if (!bar) return;

  const themeButton = document.getElementById("themeToggleButton");

  const allButtons = Array.from(bar.querySelectorAll(".controlButton"));
  const buttons = allButtons.filter((b) => b !== themeButton);

  const videoOverlay = document.getElementById("videoShadow");
  const videoEl = document.getElementById("videoShadowVideo");

  if (!videoOverlay || !videoEl) {
    console.warn("videoShadow / videoShadowVideo em falta no DOM.");
    return;
  }

  // Ajustar transições dinamicamente conforme config
  videoOverlay.style.transition = `opacity ${config.fadeInDurationMs / 1000}s ease-out`;

  let currentTimeouts = [];
  function clearAllTimeouts() {
    currentTimeouts.forEach((id) => clearTimeout(id));
    currentTimeouts = [];
  }

  function showVideoOverlay() {
    videoOverlay.classList.add("visible");
  }

  function hideVideoOverlay() {
    // mudar duração da transição para o fade-out
    videoOverlay.style.transition = `opacity ${config.fadeOutDurationMs / 1000}s ease-out`;
    videoOverlay.classList.remove("visible");
  }

  function playVideoForConfig(buttonCfg) {
    clearAllTimeouts();

    // garantir que qualquer modo alternativo é removido
    videoOverlay.classList.remove("classic-cv-active");
    videoEl.style.display = "";

    // escolher vídeo
    videoEl.pause();
    videoEl.src = buttonCfg.videoSrc;
    videoEl.load();

    // garantir que o fade-in usa o timing certo
    videoOverlay.style.transition = `opacity ${config.fadeInDurationMs / 1000}s ease-out`;

    // 1) mostrar overlay
    const t1 = setTimeout(() => {
      showVideoOverlay();

      // 2) esperar antes de dar play
      const t2 = setTimeout(() => {
        videoEl.currentTime = 0;
        videoEl.play().catch((err) => {
          console.warn("Erro a dar play no vídeo:", err);
        });
      }, config.delayBeforePlayMs);

      currentTimeouts.push(t2);
    }, 0);

    currentTimeouts.push(t1);
  }

  // Quando o vídeo acaba, faz fade-out automático
  videoEl.onended = () => {
    const t = setTimeout(() => {
      hideVideoOverlay();
    }, config.delayBeforeHideAfterEndMs);
    currentTimeouts.push(t);
  };
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

  // Handler para "classic cv" (não reproduz vídeo; delega para onClassicCv)
function triggerClassicCv(cfg, label) {
  clearAllTimeouts();

  // 🔽 AUTO-DOWNLOAD (allowed because we're still in click stack)
triggerDownload("download_files/classic_cv.pdf", "classic_cv.pdf")
  .catch(err => console.warn("Download error:", err));

  // stop/clear video
  videoEl.pause();
  videoEl.removeAttribute("src");
  try { videoEl.load(); } catch (_) {}

  // fade-in overlay
  videoOverlay.style.transition = `opacity ${config.fadeInDurationMs / 1000}s ease-out`;
  showVideoOverlay();

  if (typeof onClassicCv === "function") {
    onClassicCv({
      showOverlay: showVideoOverlay,
      hideOverlay: hideVideoOverlay,
      overlayEl: videoOverlay,
      videoEl,
      buttonCfg: cfg,
      label,
      config
    });
  }
}


  // Ligar cada botão a uma entrada do array
  buttons.forEach((btn, index) => {
    const cfg = BUTTON_VIDEO_MAP[index];
    if (!cfg) return;

    btn.addEventListener("click", () => {
      const label = cfg.label || (btn.textContent ? btn.textContent.trim() : "");

      // 1) disparar a animação de hollow / buraco na esfera
      if (typeof onTriggerPrompt === "function") {
        onTriggerPrompt(label);
      }

      // 2) classic cv -> SVG; resto -> vídeo
      if ((cfg.label || "").toLowerCase() === "classic cv") {
        triggerClassicCv(cfg, label);
      } else {
        playVideoForConfig(cfg);
      }
    });
  });
}
