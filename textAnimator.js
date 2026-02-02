
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function computeDeleteDelayMs(len, opts) {
  const minD = opts.minDeleteDelayMs ?? 0;     
  const maxD = opts.maxDeleteDelayMs ?? 6;     

  const targetTotalMs = opts.deleteTotalMs ?? 90; 

  const perChar = targetTotalMs / Math.max(1, len);

  return clamp(perChar, 1, maxD);
}



export function createTextAnimator(textEl) {
  let runId = 0;
  let cursorOn = true;

  function stripCursor(t) {
    return (t || "").replace(/▍$/, "");
  }

  function setTextWithCursor(text) {
    textEl.textContent = text + (cursorOn ? "▍" : "");
  }

  async function animateSentences(sentences, opts = {}) {
    const id = ++runId;

    const typeDelayMs = opts.typeDelayMs ?? 22;
    const preDeleteLagMs = opts.betweenSentenceMs ?? 450;
    const betweenSentenceMs = opts.betweenSentenceMs ?? 120;
    const cursorBlinkMs = opts.cursorBlinkMs ?? 420;

    // Cursor blinker 
    (async () => {
      while (id === runId) {
        cursorOn = !cursorOn;
        const current = stripCursor(textEl.textContent);
        setTextWithCursor(current);
        await sleep(cursorBlinkMs);
      }
    })();

    let current = "";
    setTextWithCursor("");

    for (const rawSentence of sentences || []) {
      if (id !== runId) return;

      const sentence = String(rawSentence || "").trim();
      if (!sentence) continue;

      // TYPE
      for (let i = 0; i < sentence.length; i++) {
        if (id !== runId) return;
        current += sentence[i];
        setTextWithCursor(current);
        await sleep(typeDelayMs);
      }

      await sleep(preDeleteLagMs);

      // DELETE (turbo)
      const perTickDelayMs = opts.deleteDelayMs ?? 1;     // use config|||
      const chunkSize = opts.deleteChunkSize ?? 12;       

      while (current.length > 0) {
        if (id !== runId) return;
        current = current.slice(0, Math.max(0, current.length - chunkSize));
        setTextWithCursor(current);

        await sleep(perTickDelayMs);
      }

    }

    textEl.textContent = "";
  }

  function stop() {
    runId++;
    cursorOn = true;
    textEl.textContent = "";
  }

  return { animateSentences, stop };
}
