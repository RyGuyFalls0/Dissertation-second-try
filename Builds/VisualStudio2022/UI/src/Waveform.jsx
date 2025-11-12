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

    // Initialize Record plugin
    recordPlugin.current = wavesurfer.current.registerPlugin(
      RecordPlugin.create()
    );

    // Start recording from microphone
    recordPlugin.current.startMic();

    // Update waveform as input is received
    recordPlugin.current.on("record-progress", (time) => {
      // You could display recording time here if you want
      // console.log("Recording time:", time);
    });

    return () => {
      recordPlugin.current.stopMic();
      wavesurfer.current.destroy();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={waveformRef} className="w-full max-w-2xl"></div>
    </div>
  );
}
