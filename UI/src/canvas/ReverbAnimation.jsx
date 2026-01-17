import React, { useRef, useEffect } from "react";

function ReverbAnimation({modal}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const modalEl = modal.current;
    if (!modalEl) return;
    const rect = modalEl?.getBoundingClientRect() || {};
    


    // Ball settings
    const ballRadius = 15;
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let dx = -10; 
    let dy = 10; 

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#89CFF0";
      ctx.fill();
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

      drawBall();

      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
      }
      
      if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
      }
      // left modal bounce
      if (x + dx < rect.left - ballRadius && x - dx < rect.left && y > rect.top && y < rect.bottom) {
        dx = -dx
      }
      // right modal bounce
      if (x - dx < rect.right + ballRadius && x + dx < rect.right && y > rect.top && y < rect.bottom) {
        dx = -dx
      }
      // top modal bounce
      if (y + dy > rect.top - ballRadius && y - dy <= rect.top && x > rect.left && x < rect.right) {
        dy = -dy
      }
      // bottom modal bounce
      if (y - dy > rect.bottom + ballRadius && y + dy <= rect.bottom && x > rect.left && x < rect.right) {
        dy = -dy
      }

      x += dx;
      y += dy;

      requestAnimationFrame(draw);
    }

    draw(); // Start animation loop

    return () => cancelAnimationFrame(draw);
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

export default ReverbAnimation
