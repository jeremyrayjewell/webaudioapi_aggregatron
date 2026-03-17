export function setCanvasDisplaySize(canvas, width, height) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.dataset.logicalWidth = String(width);
  canvas.dataset.logicalHeight = String(height);
  canvas.dataset.dpr = String(dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.display = "block";
}

export function getCanvasMetrics(canvas, ctx) {
  const logicalWidth = Number(canvas.dataset.logicalWidth || canvas.clientWidth || canvas.width);
  const logicalHeight = Number(canvas.dataset.logicalHeight || canvas.clientHeight || canvas.height);
  const dpr = Number(canvas.dataset.dpr || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: logicalWidth, height: logicalHeight };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatFrequencyAsNote(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) return "";
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const noteName = noteNames[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}
