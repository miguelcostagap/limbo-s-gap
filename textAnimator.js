// ui/textAnimator.js

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Compute an adaptive delete delay:
 * - Longer sentences => smaller delay => faster deletion
 * - Controlled by baseDeleteDelayMs, min/max, and power.
 */
function computeDeleteDelayMs(len, opts) {
  const base = opts.baseDeleteDelayMs ?? 10; // "normal" delete delay
  const minD = opts.minDeleteDelayMs ?? 2;
  const maxD = opts.maxDeleteDelayMs ?? 14;
  const power = opts.deleteSpeedPower ?? 0.75;

  // reference length where base applies (tweakable)
  const refLen = 40;

  // scale: >1 for short strings (slower), <1 for long strings (faster)
  const scale = Math.pow(refLen / Math.max(1, len), power);

  // result: long len -> smaller delay
  const adaptive = base * scale;

  // clamp so it never gets ridiculous
  return clamp(adaptive, minD, maxD);
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
    const preDeleteLagMs = opts.preDeleteLagMs ?? 450;
    const betweenSentenceMs = opts.betweenSentenceMs ?? 120;
    const cursorBlinkMs = opts.cursorBlinkMs ?? 420;

    // Cursor blinker loop
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

      // NEW: lag before deleting
      await sleep(preDeleteLagMs);

      // DELETE (adaptive speed)
      const deleteDelayMs = computeDeleteDelayMs(sentence.length, {
        baseDeleteDelayMs: opts.baseDeleteDelayMs ?? opts.deleteDelayMs ?? 10,
        minDeleteDelayMs: opts.minDeleteDelayMs ?? 2,
        maxDeleteDelayMs: opts.maxDeleteDelayMs ?? 14,
        deleteSpeedPower: opts.deleteSpeedPower ?? 0.75,
      });

      for (let i = 0; i < sentence.length; i++) {
        if (id !== runId) return;
        current = current.slice(0, -1);
        setTextWithCursor(current);
        await sleep(deleteDelayMs);
      }

      await sleep(betweenSentenceMs);
    }

    // End: clear everything
    textEl.textContent = "";
  }

  function stop() {
    runId++;
    cursorOn = true;
    textEl.textContent = "";
  }

  return { animateSentences, stop };
}
