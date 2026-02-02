import { SPHERE_CONFIG as CONFIG } from "./sphereConfigControlPanel.js";
import { createVirtualMiguel } from "./ai/virtualMiguel.js";
import { createPromptLoadingController } from "./promptLoading.js";

export function initDialogLogic({ onStartDialog, onAnimateDialog } = {}) {

  const loadingUI = createPromptLoadingController();

  const input = document.getElementById("promptTextInput");
  const button = document.getElementById("promptSendButton");

  if (!input || !button) {
    console.warn("dialogLogic: promptTextInput ou promptSendButton não encontrados.");
    return;
  }

  const vm = createVirtualMiguel({
    endpointUrl: CONFIG.gptProxyEndpoint,
    model: CONFIG.gptModel
  });

  let isBusy = false;

  async function handleSend() {
    const userText = input.value.trim();
    if (!userText) return;

    input.value = "";

    if (isBusy) return;
    isBusy = true;
  loadingUI.start();

    try {
      const result = await vm.ask(userText);

      const sentences =
        Array.isArray(result?.answerSentences) && result.answerSentences.length
          ? result.answerSentences
          : ["..."];

      const typeDelay = CONFIG.dialogTypeDelayMs ?? 22;
      const deleteDelay = CONFIG.dialogDeleteDelayMs ?? 8;
      const hold = CONFIG.dialogSentenceHoldMs ?? 300;
      const between = CONFIG.dialogBetweenSentenceMs ?? 80;

      const totalChars = sentences.reduce((sum, s) => sum + String(s).length, 0);
      const baseMs = totalChars * (typeDelay + deleteDelay) + sentences.length * (hold + between) + 400;

      const minEnvelope =
        (CONFIG.dialogInDurationMs ?? 900) +
        (CONFIG.dialogMinHoldMs ?? 2000) +
        (CONFIG.dialogOutDurationMs ?? 900);

      const durationMs = Math.max(baseMs, minEnvelope);

      if (typeof onStartDialog === "function") onStartDialog("", durationMs);
      if (typeof onAnimateDialog === "function") onAnimateDialog(sentences);
    } catch (err) {
      const fallback = "Opa. Isto falhou do meu lado. Tenta outra vez — se continuar, provavelmente é o proxy.";
      const durationMs = Math.max(fallback.length * 40, 3500);

      if (typeof onStartDialog === "function") onStartDialog(fallback, durationMs);
      console.error("Virtual Miguel error:", err);
    } finally {
          loadingUI.stop();

      isBusy = false;
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
