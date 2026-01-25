// main.js
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { initSphereConfigPanel } from "./sphereConfigControlPanel.js";
import { MagneticSphere } from "./sphere.js";
import { initUserInterface } from "./interfaceUser.js";
import { initPromptControl } from "./promptControl.js";
import { initImageShadowControl } from "./imageShadowControl.js";
import { initThemeManager } from "./themeManager.js";
import {
  initControlBarVideos,
  VIDEO_PORTAL_CONFIG,
  BUTTON_VIDEO_MAP
} from "./controlBarVideos.js";
import { initDialogLogic } from "./dialogLogic.js";
import { initClassicCvAperturePortal } from "./classicCvAperture.js";
import { createTextAnimator } from "./textAnimator.js";


// set up three-js
// root
const rootContainer = document.getElementById("threeCanvasContainer");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x393b3d);

// camera 
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 260);
camera.lookAt(0, 0, 0);

// renderer 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
rootContainer.appendChild(renderer.domElement);

// lights - (not used at the moment, wasn't looking good...)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(120, 180, 200);
scene.add(dirLight);

// shpere
const magneticSphere = new MagneticSphere(scene, camera);

// Theme manager
const themeManager = initThemeManager({
  scene,
  sphere: magneticSphere
});

// aply initial theme
themeManager.applyTheme("gray");

const appRoot = document.getElementById("rootAppContainer");

// ---------- UI: toggle (quicl actions / keyboard input) ----------

const controlBarInner = document.getElementById("controlBarInner");
const controlBarIcon = document.getElementById("controlBarIcon");
const controlBarIconImage = document.getElementById("controlBarIconImage");

const promptBarInner = document.getElementById("promptBarInner");
const promptBarIcon = document.getElementById("promptBarIcon");
const promptBarIconImage = document.getElementById("promptBarIconImage");

const themeToggleButton = document.getElementById("themeToggleButton");
// When a quick action is running we temporarily hide the entire prompt UI.
// Once the app returns to idle (and the video overlay is gone), we restore
// the initial UI state (control bar visible).
let uiAutoRestorePending = false;
const videoShadowOverlay = document.getElementById("videoShadow");

// funcions to show or hide bars
function showControlBar() {
  uiAutoRestorePending = false; // user override

  controlBarInner.classList.remove("hidden");
  controlBarIcon.classList.add("hidden");

  promptBarInner.classList.add("hidden");
  promptBarIcon.classList.remove("hidden");
}

function showPromptBar() {
  uiAutoRestorePending = false; // user override

  controlBarInner.classList.add("hidden");
  controlBarIcon.classList.remove("hidden");

  promptBarInner.classList.remove("hidden");
  promptBarIcon.classList.add("hidden");
}

function hideAllBars(){
  promptBarIcon.classList.add("hidden");
  controlBarInner.classList.add("hidden");
  promptBarInner.classList.add("hidden");
  controlBarIcon.classList.add("hidden");
}
function enterQuickActionMode() {
  hideAllBars();
  uiAutoRestorePending = true;
    if (appRoot) appRoot.classList.add("app-quick-zoom");

}
// initital sate: quick actions bar visible, keyboard input hidden
showControlBar();

// Clicking any mapped quick action hides BOTH bars (control bar + prompt bar).
if (controlBarInner) {
  const allControlButtons = Array.from(
    controlBarInner.querySelectorAll(".controlButton")
  ).filter((btn) => btn !== themeToggleButton);

  const mappedQuickActions = allControlButtons.slice(0, BUTTON_VIDEO_MAP.length);
  mappedQuickActions.forEach((btn) => {
    btn.addEventListener("click", enterQuickActionMode);
  });
}

// icons listeners
promptBarIcon.addEventListener("click", () => {
  showPromptBar();
});

controlBarIcon.addEventListener("click", () => {
  showControlBar();
});

// theme toggle button
if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    themeManager.toggleTheme();
  });
}

// mouse's postition tracker
let lastMouseNDC = { x: 0, y: 0 };

initUserInterface(
  renderer,
  camera,
  (x, y) => {
    lastMouseNDC.x = x;
    lastMouseNDC.y = y;
  },
  () => {}
);

// prompt / hollow
const promptController = initPromptControl(() => ({ ...lastMouseNDC }));
const dialogTextEl = promptController.getDialogTextElement
  ? promptController.getDialogTextElement()
  : document.getElementById("centerContentText");

const dialogAnimator = createTextAnimator(dialogTextEl);
const imageShadowController = initImageShadowControl();

const classicCvPortal = initClassicCvAperturePortal({
  config: {
    durationMs: 5200,
    spinDegTotal: 170
  }
});
// Control bar → videos + magnet 
initControlBarVideos({
  onTriggerPrompt: (label) => {
        enterQuickActionMode();

    if (
      promptController &&
      typeof promptController.triggerPrompt === "function"
    ) {
      promptController.triggerPrompt(label);
    }
  },
    onClassicCv: (helpers) => {
    classicCvPortal.playOnce(helpers);
  },
  config: VIDEO_PORTAL_CONFIG
});

// text input 
initDialogLogic({
  onStartDialog: (answer, durationMs) => {
    promptController.triggerDialog(answer, durationMs);
  },
  onAnimateDialog: (sentences) => {
    dialogAnimator.stop();
    dialogAnimator.animateSentences(sentences, {
      typeDelayMs: CONFIG.dialogTypeDelayMs,
      deleteDelayMs: CONFIG.dialogDeleteDelayMs,
      sentenceHoldMs: CONFIG.dialogSentenceHoldMs,
      betweenSentenceMs: CONFIG.dialogBetweenSentenceMs,
      cursorBlinkMs: CONFIG.dialogCursorBlinkMs
    });
  }
});


// control panel (config in dev only)
initSphereConfigPanel();

// loop
let lastTimeMs = 0;

function animate(timestampMs) {
  requestAnimationFrame(animate);

  if (!lastTimeMs) lastTimeMs = timestampMs;
  const dt = (timestampMs - lastTimeMs) / 1000;
  const time = timestampMs / 1000;
  lastTimeMs = timestampMs;

const promptState = promptController.update(dt);

imageShadowController.update(
  timestampMs,
  promptState.hollowFactor,
  promptState.phase,
  promptState.dialogMode    // TRUE when manual text input!!!!!!!!!!!!
);


 
  // Auto-restore UI after a quick action: only when we're back to idle AND
  // the video portal is no longer visible.
// Auto-restore quando volta ao controlo normal do rato (magnet real)
if (uiAutoRestorePending) {
  const mouseBackToNormal = !promptState.virtualMouseNDC; // aqui está o teu sinal do magnet

  // opcional: também exigir idle para evitar flicker
  if (mouseBackToNormal && promptState.phase === "idle") {
    showControlBar();          // estado inicial
    uiAutoRestorePending = false;
    if (appRoot) appRoot.classList.remove("app-quick-zoom");

  }
}


  // switch between live mouse tracking or random
  let mouseForSphere = lastMouseNDC;
  if (promptState.virtualMouseNDC) {
    mouseForSphere = promptState.virtualMouseNDC;
  }
  magneticSphere.setMouseNDC(mouseForSphere.x, mouseForSphere.y);

  // magnet on for idle + transition, shutodown on hollow
  // in dialog mode  mganet is always off
  const enableMagnet =
    !promptState.dialogMode &&
    (promptState.phase === "idle" ||
      promptState.phase === "transition");

  magneticSphere.update(time, {
    enableMagnet,
    hollowFactor: promptState.hollowFactor,
    dialogMode: promptState.dialogMode
  });

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
