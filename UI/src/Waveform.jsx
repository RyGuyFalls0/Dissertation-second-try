import { useEffect, useRef } from "react";
import { getAudioData } from "./api.jsx";
import WaveSurfer from "wavesurfer.js";

function LiveWaveform({ active }) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const FPS = 20;
  const SCALE = 3.0;
  const NUM_SAMPLES = 400;

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      wsRef.current = WaveSurfer.create({
        container: containerRef.current,
        height: 100,
        interact: false,
        autoScroll: false,
        autoCenter: false,
        normalize: false,
        waveColor: "red",
        cursorWidth: 0,
        barWidth: 5,
        barGap: 2,
        barRadius: 2,
        partialRender: false,
      });

      const wavesurfer = wsRef.current;
      getAudioData(wavesurfer, SCALE, NUM_SAMPLES);

      timerRef.current = setInterval(
        () => getAudioData(wavesurfer, SCALE, NUM_SAMPLES),
        1000 / FPS
      );
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timerRef.current);
      timerRef.current = null;

      if (wsRef.current) {
        wsRef.current.destroy();
        wsRef.current = null;
      }
    };
  }, [active]);

  return <div ref={containerRef} className="w-full h-[100px]" />;
}

export default LiveWaveform;