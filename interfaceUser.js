export function initUserInterface(renderer, camera, onMouseNDCChange, onResize) {
  const dom = renderer.domElement;

  dom.addEventListener("pointermove", (event) => {
    const rect = dom.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    onMouseNDCChange(x, y);
  });

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (onResize) onResize(width, height);
  });
}
