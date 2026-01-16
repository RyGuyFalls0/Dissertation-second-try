import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { stopTuner, startTuner, getTuning } from "./api.jsx";

function Tuner({ active }) {
  const [note, setNote] = useState("--");
  const [cents, setCents] = useState(0);
  const [armed, setArmed] = useState(false);

  const pollingRef = useRef(null);
  const wasRunning = useRef(false);

  // Stop tuner when carousel leaves this slide
  useEffect(() => {
    if (!active) {
      setArmed(false);
      setNote("--");
      setCents(0);
    }
  }, [active]);

  // Start / stop tuner + polling
  useEffect(() => {
    const shouldRun = active && armed;

    if (shouldRun && !wasRunning.current) {
      startTuner();
      wasRunning.current = true;

      pollingRef.current = setInterval(async () => {
        const data = await getTuning();
        if (data?.status === "success") {
          setNote(`${data.note}${data.octave}`);
          setCents(data.cents);
        }
      }, 400); // polls every 0.4s (2.5Hz)
    }

    if (!shouldRun && wasRunning.current) {
      stopTuner();
      wasRunning.current = false;

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [active, armed]);

  const ticks = Array.from({ length: 21 }, (_, i) => (i - 10) * 5);

  const getNeedleColor = () => {
    if (Math.abs(cents) < 10) return "#10b981"; 
    return "#f59e0b";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="w-[480px] rounded-2xl shadow-lg bg-zinc-900 border border-zinc-800">
        <div className="p-8 space-y-6">
          {/* Note display */}
          <div className="text-center text-3xl font-medium tracking-wide">
            {note}
          </div>

          {/* Tuner scale */}
          <div className="relative h-24 bg-black rounded-lg overflow-hidden mx-4">
            
            <svg className="w-full h-full" viewBox="0 0 400 96">
              {/* Green acceptable range box (±10 cents) */}
              <rect
                x={200 - 20}
                y={38}
                width={10 * 2 * 2}
                height={20}
                fill="rgba(16, 185, 129, 0.15)"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth={1}
              />
              
              {/* Tick marks */}
              {ticks.map((t, i) => {
                const x = (i / 20) * 400;
                const isCenter = t === 0;
                const isMajor = t % 25 === 0;
                const height = isCenter ? 30 : isMajor ? 22 : 15;
                
                return (
                  <line
                    key={t}
                    x1={x}
                    y1={48 - height / 2}
                    x2={x}
                    y2={48 + height / 2}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1}
                  />
                );
              })}
              
              {/* Thin center reference line */}
              <line
                x1={200}
                y1={18}
                x2={200}
                y2={78}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1}
              />
              
              {/* Moving needle (thick line) */}
              <motion.line
                x1={200}
                y1={18}
                x2={200}
                y2={78}
                stroke={getNeedleColor()}
                strokeWidth={6}
                strokeLinecap="round"
                animate={{ 
                  x1: 200 + (cents * 2),
                  x2: 200 + (cents * 2)
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15 
                }}
              />
            </svg>
          </div>

          {/* Status */}
          <div className="text-center text-sm">
            <span
              className={`${
                Math.abs(cents) < 5
                  ? "text-green-400"
                  : Math.abs(cents) < 15
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {Math.abs(cents) < 5
                ? "In tune"
                : cents > 0
                ? `Sharp (${cents > 0 ? '+' : ''}${cents.toFixed(1)}¢)`
                : `Flat (${cents.toFixed(1)}¢)`}
            </span>
          </div>
        </div>
      </div>

      {/* Arm button */}
      {!armed && active && (
        <button
          onClick={() => setArmed(true)}
          className="
            absolute
            px-6 py-3
            rounded-full
            border border-zinc-400
            text-sm font-medium
            text-black
            bg-white
            hover:border-black
            transition-colors
          "
        >
          Start Tuner
        </button>
      )}
    </div>
  );
}

export default Tuner;