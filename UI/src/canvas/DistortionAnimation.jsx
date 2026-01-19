import React, { useRef, useEffect } from "react";

function DistortionAnimation({ modal }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const modalEl = modal.current;
    if (!modalEl) return;

    const rect = modalEl.getBoundingClientRect();

    let blur = 0;
    let addBlur = true;
    const colour = "rgba(150, 17, 17, 0.8)"; // Dark shadow color

    function drawDistortion() {
      const padding = 200; // How far outside viewport to draw
      
      ctx.shadowBlur = blur;
      ctx.shadowColor = colour;
      ctx.fillStyle = colour;

      // Top shadow - draw rectangle above viewport
      ctx.fillRect(-padding, -padding - blur, canvas.width + padding * 2, padding + blur);
      
      // Bottom shadow
      ctx.fillRect(-padding, canvas.height, canvas.width + padding * 2, padding + blur);
      
      // Left shadow
      ctx.fillRect(-padding - blur, -padding, padding + blur, canvas.height + padding * 2);
      
      // Right shadow
      ctx.fillRect(canvas.width, -padding, padding + blur, canvas.height + padding * 2);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDistortion();

      blur += addBlur ? 1 : -1;
      if (blur >= 100) addBlur = false;
      if (blur <= 0) addBlur = true;

      requestAnimationFrame(draw);
    }

    draw();
  }, [modal]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 pointer-events-none z-0"
      />
    </div>
  );
}

export default DistortionAnimation;