// dialogLogic.js
import { SPHERE_CONFIG as CONFIG } from "./sphereConfigControlPanel.js";

/**
 * Lógica de diálogo "fake" por agora.
 * No futuro, aqui ligas à API do GPT.
 */
export function initDialogLogic({ onStartDialog } = {}) {
  const input = document.getElementById("promptTextInput");
  const button = document.getElementById("promptSendButton");

  if (!input || !button) {
    console.warn(
      "dialogLogic: promptTextInput ou promptSendButton não encontrados."
    );
    return;
  }

  function handleSend() {
    const userText = input.value.trim();
    if (!userText) return;

    // limpa o input
    input.value = "";

    // resposta fixa por agora
    const reply = "we are almost finished in creating a virtual miguel";

    // tempo de leitura proporcional ao tamanho da resposta
    const secondsPerChar = CONFIG.dialogSecondsPerChar ?? 0.08;
    const baseMs = reply.length * secondsPerChar * 1000;
    const minMs = 3000;
    const durationMs = Math.max(baseMs, minMs);

    if (typeof onStartDialog === "function") {
      onStartDialog(reply, durationMs);
    }
  }

  button.addEventListener("click", handleSend);
  input.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault();
      handleSend();
    }
  });
}
