// themeManager.js
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

// basic config + images  mapping
const THEME_CONFIG = {
  gray: {
    name: "gray",
    bodyClass: "theme-gray",
    sceneBg: 0x393b3d,
    dotColor: "#ced3d6",

    icons: {
      keyboard: "iconBrancoTeclado.png",
      control: "iconBrancoControl.png"

    },
    loading: {
      track: "#b1b8bd",
      fill: "#ffffff)"
    },
    shadowImage: "shadowSphereWhite.png",
    apertureColor: "#a0aa17",
    apertureGradA: "#44444462",
    apertureGradB: "#ced3d669",
    centerTextColor: "#ced3d6"
  },

  white: {
    name: "white",
    bodyClass: "theme-white",
    sceneBg: 0xffffff,
    dotColor: "#444444",

    icons: {
      keyboard: "iconCinzaTeclado.png",
      control: "iconCinzaControl.png"
    },
    loading: {
      track: "#444444",
      fill: "#2c2c2c"
    },
    shadowImage: "shadowSphereCinza.png",
    apertureColor: "#2323aa",
    apertureGradA: "#ced3d669",
    apertureGradB: "#4444447e",
    centerTextColor: "#444444"
  }
};

// list of elements to apply theme !!!
const THEMED_ELEMENTS = [
  "promptBarInner",
  "controlBarInner",
  "promptBarLoading",
  "controlPanel",
  "centerContentOverlay"
];

// make it pretty :)
export function initThemeManager({ scene, sphere }) {

  const keyboardIcon = document.getElementById("promptBarIconImage");
  const controlIcon = document.getElementById("controlBarIconImage");
  const shadowImage = document.getElementById("imageShadowImage");

  let currentTheme = "gray";

  function applyTheme(name) {
    const cfg = THEME_CONFIG[name];
    if (!cfg) return;
    currentTheme = name;

    // 1) classes in body ---> CSS variables and dependencies fo the theme
    document.body.classList.remove(
      THEME_CONFIG.gray.bodyClass,
      THEME_CONFIG.white.bodyClass
    );
    document.body.classList.add(cfg.bodyClass);

    // 2) scene background
    if (scene) {
      scene.background = new THREE.Color(cfg.sceneBg);
    }

    // 3) shpere's dot's colors
    if (sphere && sphere.setDotColor) {
      sphere.setDotColor(cfg.dotColor);
    }

    // 4) icons
    if (keyboardIcon) {
      keyboardIcon.src = cfg.icons.keyboard;
    }
    if (controlIcon) {
      controlIcon.src = cfg.icons.control;
    }

    // 5) portal's img
    if (shadowImage) {
      shadowImage.src = cfg.shadowImage;
    }

    // 6) mark elements is-theme-gray / is-theme-white
    THEMED_ELEMENTS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("is-theme-gray", "is-theme-white");
      el.classList.add(`is-theme-${name}`);
    });

    // 7) expose theme colors to CSS (SVG + center text use these)
    document.documentElement.style.setProperty("--aperture-color", cfg.apertureColor);
    document.documentElement.style.setProperty("--center-text-color", cfg.centerTextColor);
    document.documentElement.style.setProperty("--aperture-grad-a", cfg.apertureGradA);
    document.documentElement.style.setProperty("--aperture-grad-b", cfg.apertureGradB);
    // 8) theme variables for loading bar
    document.documentElement.style.setProperty("--loading-track", cfg.loading?.track || "rgba(255,255,255,0.08)");
    document.documentElement.style.setProperty("--loading-fill", cfg.loading?.fill || "rgba(255,255,255,0.30)");

  }

  function toggleTheme() {
    applyTheme(currentTheme === "gray" ? "white" : "gray");
  }

  function getCurrentTheme() {
    return currentTheme;
  }

  return { applyTheme, toggleTheme, getCurrentTheme };

}
