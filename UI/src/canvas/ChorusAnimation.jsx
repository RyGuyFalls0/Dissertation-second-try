import React, { useRef, useEffect } from "react";

function ChorusAnimation({modal}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const modalEl = modal.current;
    if (!modalEl) return;
    const rect = modalEl?.getBoundingClientRect() || {};

    // Ball settings
    const ballRadius = 15;
    let x = Array(10).fill(canvas.width / 4);
    let y = [];
    for (var i = 1 ; i <= 11; i++) {
        y.push((rect.bottom+rect.top)*i/11);
    }
    let dx = Array.from(
      { length: Math.round((10 - 5) / 0.5) + 1 },
      (_, i) => 5 + i * 0.5
    );

    let colour = ["#89CFF0","#94BCDA","#9EA9C4","#A997AF","#B48499","#BF7183","#C95E6D","#D44B57","#DF3841","#EA262C","#F41316","#FF0000"]

    function drawBall(x, y, colour) {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = colour;
      ctx.fill();
      ctx.closePath();
    }
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

      for (var i = 0 ; i < 10; i++) {
        drawBall(x[i], y[i], colour[i]);
        if (x[i] + dx[i] > rect.right + 200 || x[i] + dx[i] < rect.left - 200) {
          dx[i] = -dx[i]
        }
        x[i] += dx[i]
      }
      requestAnimationFrame(draw);
    }
    draw(); // Start animation loop

  });

  return (
    <div classname="relative">
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="absolute inset-0 pointer-events-none z-0"
    />
    </div>
  );
}

export default ChorusAnimation
