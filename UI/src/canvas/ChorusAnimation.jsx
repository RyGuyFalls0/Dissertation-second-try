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
    let x = [canvas.width / 2]*10;
    let y = [];
    for (var i = 0 ; i < 10; i++) {
        y.append((rect.height/10) * i);
    }
    let dx = [2,4,6,8,10,12,14,16,18,20]; 

    function drawBall(x, y) {
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

      for (var i = 0 ; i < 10; i++) {
        drawBall(x[i], y[i]);
      }
    }
  });
}
