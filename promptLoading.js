export function createPromptLoadingController() {
  const promptBarInner = document.getElementById("promptBarInner");
  const promptBarLoading = document.getElementById("promptBarLoading");
  const fill = document.getElementById("promptLoadingFill");

  if (!promptBarInner || !promptBarLoading || !fill) {
    console.warn("promptLoading: missing elements");
    return {
      start: () => {},
      stop: () => {}
    };
  }

  let rafId = null;
  let startTs = 0;
  let progress = 0;

  function setFill(pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    fill.style.width = `${clamped}%`;
  }

  // Fake progress curve :DDDDDD
  // - fast start to 60%
  // - slowly approaches 92% and waits for completion
  function tick(ts) {
    if (!startTs) startTs = ts;
    const t = (ts - startTs) / 1000; // seconds

    // Two-phase curve (tuned for "feels responsive"):
    // Phase 1: 0s..1.2s -> 0..60
    // Phase 2: after -> asymptotic to 92
    let target;
    if (t < 1.2) {
      target = (t / 1.2) * 60;
    } else {
      const tt = t - 1.2;
      target = 60 + (82 - 60) * (1 - Math.exp(-tt * 0.9));
    }

    // smooth towards target
    progress = Math.max(progress, target);
    setFill(progress);

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    // swap UI
    promptBarInner.classList.add("hidden");
    promptBarLoading.classList.remove("hidden");

    // reset
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    startTs = 0;
    progress = 0;
    setFill(0);

    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    // complete quickly
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;

    setFill(100);

    // small delay so user sees completion, then swap back
    setTimeout(() => {
      promptBarLoading.classList.add("hidden");
      promptBarInner.classList.remove("hidden");
      setFill(0);
    }, 180);
  }

  return { start, stop };
}
