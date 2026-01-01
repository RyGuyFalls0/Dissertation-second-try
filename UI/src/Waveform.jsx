import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function LiveWaveform({ active }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  const peaksRef = useRef([]);
  const animationRef = useRef(null);

  const MAX_POINTS = 300;
  const FPS = 30;

  useEffect(() => {
    if (!active || !waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "red",
      progressColor: "darkred",
      cursorWidth: 0,
      interact: false,
      height: 128, // Explicit height for the waveform
      normalize: true,
    });

    startPolling();

    return () => {
      stopPolling();
      wavesurfer.current?.destroy();
    };
  }, [active]);

  function startPolling() {
    const interval = 100;

    animationRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/getAudioData");
        const data = await res.json();
        
        let min = -1e-4;
        let max = 1e-4;

        if (data.status === "success") {
          min = data.min;
          max = data.max;
        }

        peaksRef.current.push(min, max);

        if (peaksRef.current.length > MAX_POINTS * 2) {
          peaksRef.current.splice(
            0,
            peaksRef.current.length - MAX_POINTS * 2
          );
        }

        const duration = peaksRef.current.length / 2 / FPS;

        if (wavesurfer.current) {
          wavesurfer.current.load(
            null,
            [...peaksRef.current],
            duration
          );
        }
      } catch (e) {
        console.error(e);
      }
    }, interval);
  }

  function stopPolling() {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={waveformRef} className="w-full max-w-2xl" style={{ height: '128px' }}></div>
    </div>
  );
}