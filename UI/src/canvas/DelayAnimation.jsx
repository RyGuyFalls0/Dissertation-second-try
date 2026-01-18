import { useRef, useEffect } from "react";

function DelayAnimation({ modal }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let ballRadius = 15;
    let y1 = window.innerHeight / 2;
    let y2 = window.innerHeight / 2;
    let dy1 = 5; // positive = downwards
    let dy2 = -5; // positive = downwards


    const x1 = canvas.width * 0.25;
    const x2 = canvas.width * 0.75;
    const colour1 = "rgb(255, 50, 100)";
    const colour2 = "rgb(100, 150, 255)";

    function drawBall(x, y, colour) {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = colour;
      ctx.fill();
      ctx.closePath();
    }

    function draw() {
      // Clear using fade to leave trailing effect
      ctx.fillStyle = "rgb(255 255 255 / 30%)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawBall(x1, y1, colour1);
      drawBall(x2, y2, colour2);

      y1 += dy1;
      y2 += dy2
      if (y1 + ballRadius > canvas.height || y1 - ballRadius < 0) {
        dy1 = -dy1; 
      }
      if (y2 + ballRadius > canvas.height || y2 - ballRadius < 0) {
        dy2 = -dy2; 
      }

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

export default DelayAnimation;
