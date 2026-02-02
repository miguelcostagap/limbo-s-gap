export function initImageShadowControl() {
  const container = document.getElementById("imageShadow");
  const image = document.getElementById("imageShadowImage");

  let scale = 0;
  let targetScale = 0;

  return {
    /**
     * @param {number} t            - timestamp (ms)
     * @param {number} hollowFactor - 0..1
     * @param {string} phase        - "idle" | "transition" | "hollow"
     * @param {boolean} dialogMode  - true quando vem do text input / AI
     */
    update(t, hollowFactor, phase, dialogMode = false) {
      // ─────────────────────────────────────
      //  "CONTROL" MODO (PORTAL / VIDEOS)
      // ─────────────────────────────────────
      if (!dialogMode) {
        if (phase === "hollow") {
          //  normalportal (full → scale 1)
          targetScale = 1;
          container.classList.add("visible");
        } else {
          targetScale = 0;
        }
      }
      // ─────────────────────────────────────
      // "DIALOG" MODE (VIRTUAL MIGUEL)
      // ─────────────────────────────────────
      else {

        container.classList.add("visible");


        const baseScale = hollowFactor;
        targetScale = 0;
        container.classList.remove("visible");
      }

      // easing
      scale += (targetScale - scale) * 0.12;

      // transforms img
      image.style.transform = `scale(${scale})`;

      // hide when near 0
      if (!dialogMode && phase !== "hollow" && scale < 0.01) {
        container.classList.remove("visible");
      }
      if (dialogMode && hollowFactor < 0.01 && scale < 0.01) {
        container.classList.remove("visible");
      }
    }
  };
}
