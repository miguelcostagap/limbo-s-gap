import { SPHERE_CONFIG as CONFIG } from "./sphereConfigControlPanel.js";

// Config 
export const VIDEO_PORTAL_CONFIG = {
  fadeInDurationMs: 500,
  fadeOutDurationMs: 500,
  delayBeforePlayMs: 200,
  delayBeforeHideAfterEndMs: 300
};
export const BUTTON_VIDEO_MAP = [
  {
    label: "my work",
    videoSrc: "videos/my_work.mp4",
    timings: {
      prompt: {
        transitionDurationMs: 700,
        hollowDurationMs: 2200,
        hollowEasing: 0.12
      },
      imageShadow: {
        showDelayMs: 120,
        hideDelayMs: 0,
        easing: 0.14,
        maxScale: 1.0
      },
      video: {
        fadeInDurationMs: 450,
        fadeOutDurationMs: 450,
        overlayShowDelayMs: 0,
        delayBeforeHideAfterEndMs: 300
      }
    }
  },
  {
    label: "classic cv",
    videoSrc: "videos/classic-cv.mp4",
    timings: {
      prompt: {
        transitionDurationMs: 900,
        hollowDurationMs: 3200,
        hollowEasing: 0.10
      },
      imageShadow: {
        showDelayMs: 0,
        hideDelayMs: 0,
        easing: 0.12,
        maxScale: 1.0
      },
      video: {
        fadeInDurationMs: 500,
        fadeOutDurationMs: 500,
        overlayShowDelayMs: 0,
        delayBeforeHideAfterEndMs: 300
      }
    }
  }
];


// initControlBarVideos gets callbacks:
// - onTriggerPrompt(label): shoots hollow / prompt (keep)
// - onClassicCv(helpers): execute  SVG 1x (new)
export function initControlBarVideos({
  onTriggerPrompt,
  onClassicCv,                
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
    videoOverlay.style.transition = `opacity ${config.fadeOutDurationMs / 1000}s ease-out`;
    videoOverlay.classList.remove("visible");
  }

function playVideoForConfig(buttonCfg) {
  clearAllTimeouts();

  videoOverlay.classList.remove("classic-cv-active");
  videoEl.style.display = "";

  videoEl.pause();
  videoEl.src = buttonCfg.videoSrc;
  videoEl.load();

  videoOverlay.style.transition = `opacity ${config.fadeInDurationMs / 1000}s ease-out`;

  showVideoOverlay();

  // PLAY SINCHRONOUS1!!!!
  videoEl.currentTime = 0;
  videoEl.play().catch((err) => {
    console.warn("Erro a dar play no vídeo:", err);
  });
}


  // WHEN VIDEO ENDS, fade-out
  videoEl.onended = () => {
    const t = setTimeout(() => {
      hideVideoOverlay();
    }, config.delayBeforeHideAfterEndMs);
    currentTimeouts.push(t);
  };
  async function triggerDownload(url, filename) {
    // Must be called directly from the click handler chain to avoid popup-blockers
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

  // Handler para "classic cv"
  function triggerClassicCv(cfg, label) {
    clearAllTimeouts();

    // AUTO-DOWNLOAD
    triggerDownload("download_files/classic_cv.pdf", "classic_cv.pdf")
      .catch(err => console.warn("Download error:", err));

    // stop/clear video
    videoEl.pause();
    videoEl.removeAttribute("src");
    try { videoEl.load(); } catch (_) { }

    // fade-in overlay
    videoOverlay.style.transition = `opacity ${CONFIG.fadeInDurationMs / 1000}s ease-out`;
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


  // CONNECT BTNS TO ARRAY
  buttons.forEach((btn, index) => {
    const cfg = BUTTON_VIDEO_MAP[index];
    if (!cfg) return;

    btn.addEventListener("click", () => {
      const label = cfg.label || (btn.textContent ? btn.textContent.trim() : "");

      // 1) START hollow / "hole""" in sphere
      if (typeof onTriggerPrompt === "function") {
onTriggerPrompt(label, { hollowDurationMs: CONFIG.hollowDurationMs });
      }

      // 2) classic cv -> SVG
      if ((cfg.label || "").toLowerCase() === "classic cv") {
        triggerClassicCv(cfg, label);
      } else {
        playVideoForConfig(cfg);
      }
    });
  });
}
