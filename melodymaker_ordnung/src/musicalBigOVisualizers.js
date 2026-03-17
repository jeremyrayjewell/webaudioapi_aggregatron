export function drawFrequencyBars({
  canvas,
  frequencies,
  getCanvasMetrics,
  formatFrequencyAsNote,
}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = getCanvasMetrics(canvas, ctx);
  ctx.clearRect(0, 0, width, height);

  if (frequencies.length === 0) return;
  const maxFreq = 800;
  const horizontalPadding = 6;
  const availableWidth = Math.max(1, width - horizontalPadding * 2);
  const gap = Math.max(2, Math.floor(availableWidth * 0.04));
  const totalGapWidth = gap * Math.max(0, frequencies.length - 1);
  const barWidth = Math.max(
    6,
    Math.floor((availableWidth - totalGapWidth) / Math.max(1, frequencies.length))
  );
  const contentWidth = barWidth * frequencies.length + totalGapWidth;
  let xPos = Math.max(horizontalPadding, Math.floor((width - contentWidth) / 2));

  const bgColor = "#000000";
  const highlightColor = "#ffffff";
  const textColor = "#00ff00";
  const borderColor = "#00aaaa";

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
  ctx.fillStyle = highlightColor;
  frequencies.forEach((freq) => {
    const barHeight = Math.min(150, (freq / maxFreq) * height * 0.8);
    const yPos = height - barHeight - 10;

    const gradient = ctx.createLinearGradient(xPos, yPos, xPos, yPos + barHeight);
    gradient.addColorStop(0, "#00aaaa");
    gradient.addColorStop(0.7, "#0000aa");
    gradient.addColorStop(1, "#000044");

    ctx.fillStyle = gradient;
    ctx.fillRect(xPos, yPos, barWidth, barHeight);

    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(xPos, yPos, barWidth, barHeight);

    ctx.fillStyle = textColor;
    ctx.font = "12px 'Px437_IBM_EGA8', 'DOS', monospace";
    ctx.fillText(
      `${freq.toFixed(0)}Hz ${formatFrequencyAsNote(freq)}`,
      xPos,
      yPos - 5
    );

    xPos += barWidth + gap;
  });
}

export function drawDrumPatternGrid({
  canvas,
  rhythmPattern,
  currentStep,
  getCanvasMetrics,
  drumTypes,
}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = getCanvasMetrics(canvas, ctx);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  const patternLen = rhythmPattern.length;
  const rowCount = drumTypes.length;

  const cellWidth = Math.max(12, Math.floor(width / patternLen) - 1);
  const cellHeight = Math.max(12, Math.floor(height / rowCount) - 1);

  for (let step = 0; step < patternLen; step++) {
    const drumType = rhythmPattern[step];
    const rowIndex = drumTypes.indexOf(drumType);

    for (let row = 0; row < rowCount; row++) {
      const x = step * cellWidth;
      const y = row * cellHeight;

      if (step === currentStep) {
        ctx.fillStyle = "#ddd";
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }

      if (row === rowIndex && rowIndex !== -1) {
        let fillColor = "gray";
        switch (drumType) {
          case "kick":
            fillColor = "orange";
            break;
          case "snare":
            fillColor = "red";
            break;
          case "hihat":
            fillColor = "green";
            break;
          case "tomLow":
            fillColor = "blue";
            break;
          case "tomMid":
            fillColor = "teal";
            break;
          case "tomHigh":
            fillColor = "purple";
            break;
          case "clap":
            fillColor = "pink";
            break;
          case "ride":
            fillColor = "gold";
            break;
          case "crash":
            fillColor = "yellow";
            break;
          default:
            fillColor = "gray";
            break;
        }
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      } else {
        ctx.strokeStyle = "#aaa";
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }
    }
  }
}
