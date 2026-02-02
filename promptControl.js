import { SPHERE_CONFIG as CONFIG } from "./sphereConfigControlPanel.js";

const Phase = {
  Idle: "idle",
  Transition: "transition",
  Hollow: "hollow"
};

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function initPromptControl(getMouseNDC) {
  const overlay = document.getElementById("centerContentOverlay");
  const overlayText = document.getElementById("centerContentText");

  let phase = Phase.Idle;

  let hollowFactor = 0;
  let hollowTarget = 0;

  let transitionStartTime = 0;
  let transitionFromMouse = { x: 0, y: 0 };
  let virtualMouse = { x: 0, y: 0 };

  let hollowStartTime = 0;
  let hollowDuration = CONFIG.hollowDurationMs;

  const transitionDurationMs = () => CONFIG.promptTransitionDurationMs;

  let mode = "idle"; // "idle" | "control" | "dialog"

  // ---- DIALOG MODE ----
  let dialogStartTime = 0;
  let dialogTotalDuration = 0;
  let dialogInDuration = CONFIG.dialogInDurationMs;
  let dialogOutDuration = CONFIG.dialogOutDurationMs;
  let dialogMinHold = CONFIG.dialogMinHoldMs;
  let dialogHoldEnd = 0;

  let promptTransitionDurationMs = CONFIG.promptTransitionDurationMs;
  let hollowDurationMs = CONFIG.hollowDurationMs;
  let hollowEasing = CONFIG.hollowEasing;

  function triggerPrompt(text, opts = {}) {
    const mouse = getMouseNDC ? getMouseNDC() : { x: 0, y: 0 };

    // SHOW overlay/texto
    if (text) {
      overlayText.textContent = text;
      overlay.classList.add("visible");
    }

  
    transitionFromMouse = { x: mouse.x, y: mouse.y };
    virtualMouse = { x: mouse.x, y: mouse.y };
    transitionStartTime = performance.now();

    // Defaults 
    promptTransitionDurationMs = CONFIG.promptTransitionDurationMs;
    hollowDurationMs = CONFIG.hollowDurationMs;
    hollowEasing = CONFIG.hollowEasing;

    // Overrides por botão (se vierem)
    if (typeof opts.transitionDurationMs === "number") {
      promptTransitionDurationMs = Math.max(0, opts.transitionDurationMs);
    }
    if (typeof opts.hollowDurationMs === "number") {
      hollowDurationMs = Math.max(0, opts.hollowDurationMs);
    }
    if (typeof opts.hollowEasing === "number") {
      hollowEasing = clamp01(opts.hollowEasing);
    }

    // GET normal fluxo  from prompt control
    mode = "control";
    phase = Phase.Transition;

    // Reset do hollow
    hollowTarget = 0;
    // hollowFactor = 0;
  }

  // ---------- DIALOG (text input / AI) ----------
  function triggerDialog(answerText, durationMs) {
    const now = performance.now();

    overlayText.textContent = answerText;
    overlay.classList.add("visible");

    mode = "dialog";
    phase = Phase.Hollow; 

    dialogInDuration = CONFIG.dialogInDurationMs;
    dialogOutDuration = CONFIG.dialogOutDurationMs;
    dialogMinHold = CONFIG.dialogMinHoldMs;

    const minTotal = dialogInDuration + dialogMinHold + dialogOutDuration;
    dialogTotalDuration = Math.max(durationMs, minTotal);

    dialogStartTime = now;
    dialogHoldEnd = dialogStartTime + dialogTotalDuration - dialogOutDuration;

    hollowFactor = 0;
    hollowTarget = 0;
  }

  function update(dt) {
    const now = performance.now();

    // ============ DIALOG MODE =============
    if (mode === "dialog") {
      const t = now - dialogStartTime;
      const endTime = dialogStartTime + dialogTotalDuration;

      let intensity = 0;

      if (t <= 0) {
        intensity = 0;
      } else if (t < dialogInDuration) {
        const localT = t / dialogInDuration;
        intensity = easeInOutQuad(localT);
      } else if (t < dialogHoldEnd) {
        intensity = 1;
      } else if (t < endTime) {
        const localT = (t - dialogHoldEnd) / dialogOutDuration;
        intensity = 1 - easeInOutQuad(localT);
      } else {
        intensity = 0;
      }

      hollowTarget = intensity;
      hollowFactor += (hollowTarget - hollowFactor) * CONFIG.hollowEasing;

      if (t > endTime && hollowFactor < 0.01) {
        phase = Phase.Idle;
        mode = "idle";
        overlay.classList.remove("visible");
        hollowFactor = 0;
      }

      return {
        hollowFactor,
        phase,
        virtualMouseNDC: null,
        dialogMode: true
      };
    }

    // ============ CONTROL MODE (videos / random magnet) ============
    if (mode === "control" && phase === Phase.Transition) {
      const dur = transitionDurationMs();
      const t = Math.min(1, (now - transitionStartTime) / dur);

      virtualMouse.x = transitionFromMouse.x * (1 - t);
      virtualMouse.y = transitionFromMouse.y * (1 - t);

      if (t >= 1) {
        phase = Phase.Hollow;
        hollowStartTime = now;
        hollowTarget = 1;
      }
    }

    if (mode === "control" && phase === Phase.Hollow) {
      const elapsed = now - hollowStartTime;
      if (elapsed > hollowDuration * 0.6) {
        hollowTarget = 0;
      }
      if (elapsed > hollowDuration * 1.4) {
        hollowTarget = 0;
      }
    }

    hollowFactor += (hollowTarget - hollowFactor) * CONFIG.hollowEasing;

    if (
      mode === "control" &&
      phase === Phase.Hollow &&
      hollowTarget === 0 &&
      hollowFactor < 0.01
    ) {
      phase = Phase.Idle;
      mode = "idle";
      overlay.classList.remove("visible");
      hollowFactor = 0;
    }

    return {
      hollowFactor,
      phase,
      virtualMouseNDC: phase === Phase.Transition ? { ...virtualMouse } : null,
      dialogMode: false
    };
  }

  return {
    update,
    triggerPrompt,
    triggerDialog,
      getDialogTextElement: () => overlayText

  };
}
