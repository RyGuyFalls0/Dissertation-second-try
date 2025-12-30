import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export default function LiveWaveform() {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const recordPlugin = useRef(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "red",
      progressColor: "darkred",
      cursorWidth: 0,
      interact: false,
      height: 200,
      barWidth: 5,
    });

    recordPlugin.current = wavesurfer.current.registerPlugin(
      RecordPlugin.create()
    );

    recordPlugin.current.startMic();

    return () => {
      recordPlugin.current.stopMic();
      wavesurfer.current.destroy();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={waveformRef} className="w-full max-w-2xl h-full"></div>
    </div>
  );
}
