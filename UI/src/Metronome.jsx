import { useEffect, useRef, useState } from "react";

function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);

  const holdInterval = useRef(null);
  const holdSpeed = useRef(200);

  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const timerIDRef = useRef(null);

  const beatsPerMeasure = 4;
  const lookahead = 25;
  const scheduleAheadTime = 0.1;

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();

    masterGainRef.current = audioCtxRef.current.createGain();
    masterGainRef.current.gain.value = volume;
    masterGainRef.current.connect(audioCtxRef.current.destination);
  }, []);

  useEffect(() => {
    if (!masterGainRef.current) return;

    masterGainRef.current.gain.setTargetAtTime(
      volume,
      audioCtxRef.current.currentTime,
      0.01
    );
  }, [volume]);

  const playClick = (time, isAccent) => {
    const osc = audioCtxRef.current.createOscillator();

    osc.frequency.value = isAccent ? 1000 : 800;
    osc.connect(masterGainRef.current);

    osc.start(time);
    osc.stop(time + 0.05);
  };

  const startHold = (delta) => {
    changeBpm(delta);

    holdSpeed.current = 200;

    holdInterval.current = setInterval(() => {
      changeBpm(delta);
      holdSpeed.current = Math.max(50, holdSpeed.current - 15);
      clearInterval(holdInterval.current);
      holdInterval.current = setInterval(
        () => changeBpm(delta),
        holdSpeed.current
      );
    }, holdSpeed.current);
  };

  const stopHold = () => {
    clearInterval(holdInterval.current);
  };

  const changeBpm = (delta) => {
    setBpm((b) => Math.min(240, Math.max(40, b + delta)));
  };

  const scheduler = () => {
    while (
      nextNoteTimeRef.current <
      audioCtxRef.current.currentTime + scheduleAheadTime
    ) {
      const isAccent = currentBeatRef.current % beatsPerMeasure === 0;
      playClick(nextNoteTimeRef.current, isAccent);

      nextNoteTimeRef.current += 60 / bpm;
      currentBeatRef.current++;
    }

    timerIDRef.current = setTimeout(scheduler, lookahead);
  };

  const startMetronome = () => {
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = audioCtxRef.current.currentTime;
    scheduler();
    setIsPlaying(true);
  };

  const stopMetronome = () => {
    clearTimeout(timerIDRef.current);
    setIsPlaying(false);
  };

  const toggleMetronome = () => {
    isPlaying ? stopMetronome() : startMetronome();
  };

  const volumePercentage = Math.round(volume * 100);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex items-center gap-8">
        {/* Metronome Controls */}
        <div className="flex flex-col items-center">
        <div className="flex items-center gap-8">
          <button
            className="w-16 h-16 rounded-full border-2 border-red-500
                      text-4xl font-light flex items-center justify-center
                      active:scale-95 select-none"
            onMouseDown={() => startHold(-1)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={() => startHold(-1)}
            onTouchEnd={stopHold}
          >
            −
          </button>

          <span className="text-5xl font-medium tracking-wide">
            {bpm} BPM
          </span>

          <button
            className="w-16 h-16 rounded-full border-2 border-red-500
                      text-4xl font-light flex items-center justify-center
                      active:scale-95 select-none"
            onMouseDown={() => startHold(1)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={() => startHold(1)}
            onTouchEnd={stopHold}
          >
            +
          </button>
        </div>
        
        <button 
          className="mt-6 px-10 py-3 rounded-full bg-black text-white text-lg active:scale-95" 
          onClick={toggleMetronome}
        > 
          {isPlaying ? "Stop" : "Start"} 
        </button>
      </div>

      {/* Volume Slider */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-32 w-8 bg-gray-300">
          <div 
            className="absolute bottom-0 w-full bg-gray-600"
            style={{ height: `${volumePercentage}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
          />
        </div>
        
        <span className="text-sm">{volumePercentage}</span>
      </div>
    </div>
    </div>
  );
}

export default Metronome;