// imageShadowControl.js

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
      // MODO "CONTROL" (PORTAL FORTE / VÍDEOS)
      // ─────────────────────────────────────
      if (!dialogMode) {
        if (phase === "hollow") {
          // portal normal (tamanho cheio → scale 1)
          targetScale = 1;
          container.classList.add("visible");
        } else {
          targetScale = 0;
        }
      }
      // ─────────────────────────────────────
      // MODO "DIALOG" (VIRTUAL MIGUEL / STATIC SUAVE)
      // ─────────────────────────────────────
      else {
        // fica sempre visível enquanto houver hollowFactor
        container.classList.add("visible");

        // hollowFactor 0→1 → queremos metade do tamanho da imagem normal
        // quando intensidade está no máximo
        const baseScale = hollowFactor; // 0..1
        targetScale = baseScale * 0.5;  // 👈 METADE DO TAMANHO VISUAL
      }

      // easing suave na escala
      scale += (targetScale - scale) * 0.12;

      // aplica a transformação na imagem
      image.style.transform = `scale(${scale})`;

      // esconder quando ficou praticamente 0
      if (!dialogMode && phase !== "hollow" && scale < 0.01) {
        container.classList.remove("visible");
      }
      if (dialogMode && hollowFactor < 0.01 && scale < 0.01) {
        container.classList.remove("visible");
      }
    }
  };
}
