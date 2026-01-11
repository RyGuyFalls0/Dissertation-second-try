import { useEffect, useRef } from "react";

export default function LiveWaveform({ active }) {
  const canvasRef = useRef(null);
  const barsRef = useRef([]);

  const NUM_BARS = 400;
  const FPS = 30;
  const DECAY = 0.88;      // lower = faster fall
  const SCALE = 3.0;       // gain for guitar input

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Init bars
    barsRef.current = new Array(NUM_BARS).fill(0);

    let rafId;
    let timerId;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    // ---- FETCH AUDIO LEVEL ----
    async function pollBackend() {
      let maxValue = 0;

      try {
        const res = await fetch("/api/getAudioData");
        const data = await res.json();

        if (data.status === "success") {
          maxValue = Math.abs(data.max);
        }
      } catch {
        maxValue = 0;
      }

      // scale + clamp
      let v = Math.min(maxValue * SCALE, 1);

      // update bars with decay
      for (let i = 0; i < NUM_BARS; i++) {
        barsRef.current[i] = Math.max(
          v,
          barsRef.current[i] * DECAY
        );
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const barWidth = w / NUM_BARS;

      ctx.fillStyle = "red";

      for (let i = 0; i < NUM_BARS; i++) {
        const value = barsRef.current[i];
        const barHeight = value * h;

        ctx.fillRect(
          i * barWidth,
          (h - barHeight) / 2,
          barWidth * 0.6,
          barHeight
        );
      }

      rafId = requestAnimationFrame(draw);
    }

    timerId = setInterval(pollBackend, 1000 / FPS);
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(timerId);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <div className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        className="w-full max-w-2xl"
        style={{ height: "128px" }}
      />
    </div>
  );
}
