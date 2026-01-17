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
    const colour = "rgba(255, 50, 100, 1)";

    function drawDistortion() {
      ctx.shadowBlur = blur;
      ctx.shadowColor = colour;
      ctx.strokeStyle = colour;
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDistortion(rect);

      blur += addBlur ? 1 : -1;
      if (blur >= 100) addBlur = false;
      if (blur <= 0) addBlur = true;

      requestAnimationFrame(draw);
    }

    draw();
  }, [modal]);

  return (
    <div className="relative">
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
