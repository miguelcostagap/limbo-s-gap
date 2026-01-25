// ui/textAnimator.js
// Sentence-by-sentence animation:
// - type char-by-char with a blinking cursor
// - pause
// - delete quickly
// - repeat

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function createTextAnimator(textEl) {
  let runId = 0;
  let cursorOn = true;

  function stripCursor(t) {
    return (t || "").replace(/▍$/, "");
  }

  function setTextWithCursor(text) {
    // Cursor is a glyph; keep it simple and reliable.
    textEl.textContent = text + (cursorOn ? "▍" : "");
  }

  async function animateSentences(sentences, opts = {}) {
    const id = ++runId;

    const {
      typeDelayMs = 22,
      deleteDelayMs = 8,
      sentenceHoldMs = 300,
      betweenSentenceMs = 80,
      cursorBlinkMs = 420
    } = opts;

    // Cursor blinker (async loop)
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

      // Type
      for (let i = 0; i < sentence.length; i++) {
        if (id !== runId) return;
        current += sentence[i];
        setTextWithCursor(current);
        await sleep(typeDelayMs);
      }

      await sleep(sentenceHoldMs);

      // Delete fast
      for (let i = 0; i < sentence.length; i++) {
        if (id !== runId) return;
        current = current.slice(0, -1);
        setTextWithCursor(current);
        await sleep(deleteDelayMs);
      }

      await sleep(betweenSentenceMs);
    }

    // Clear at end (your requirement: everything goes away)
    textEl.textContent = "";
  }

  function stop() {
    // Invalidate current animation
    runId++;
    cursorOn = true;
    textEl.textContent = "";
  }

  return { animateSentences, stop };
}
