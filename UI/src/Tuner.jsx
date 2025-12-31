import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { stopTuner, startTuner} from "./api.jsx"

function Tuner({ active }) {
    const [note, setNote] = useState("A2");
    const [cents, setCents] = useState(0); // -50 to +50
    const [armed, setArmed] = useState(false)
    const wasRunning = useRef(false);

    useEffect(() => {
        if (!active) {
            setArmed(false);
        }

    }, [active]);

    useEffect(() => {
    const shouldRun = active && armed;

    if (shouldRun && !wasRunning.current) {
        startTuner();
        wasRunning.current = true;
    }

    if (!shouldRun && wasRunning.current) {
        stopTuner();
        wasRunning.current = false;
    }
    }, [active, armed]);

  // Mock animation for now
  useEffect(() => {
    const id = setInterval(() => {
      setCents((c) => Math.max(-50, Math.min(50, c + (Math.random() * 8 - 4))));
    }, 400);
    return () => clearInterval(id);
  }, []);

  const ticks = Array.from({ length: 13 }, (_, i) => i - 6); // -6 .. +6

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="w-[480px] rounded-2xl shadow-lg bg-zinc-900 border-zinc-800">
        <div className="p-8 space-y-6">
            {/* Note display */}
            <div className="text-center text-3xl font-medium tracking-wide">
            {note}
            </div>

            {/* Tuner scale */}
            <div className="relative h-24">
            {/* Center line */}
            <div className="absolute left-1/2 top-2 bottom-2 w-[3px] bg-white rounded" />

            {/* Tick marks */}
            <div className="absolute inset-x-4 top-1/2 h-px bg-zinc-600" />
            <div className="absolute inset-x-4 top-1/2 flex justify-between">
                {ticks.map((t) => (
                <div
                    key={t}
                    className={`w-px ${Math.abs(t) === 6 ? "h-8" : "h-5"} bg-zinc-500`}
                />
                ))}
            </div>

            {/* Moving indicator */}
            <motion.div
                className="absolute top-2 bottom-2 w-[3px] bg-white rounded"
                animate={{ x: `${(cents / 50) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                style={{ left: "50%" }}
            />
            </div>

            {/* Status */}
            <div className="text-center text-sm text-zinc-400">
            {Math.abs(cents) < 5 ? "In tune" : cents > 0 ? "Sharp" : "Flat"}
            </div>
        </div>
        </div>

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
            "
        >
            Start Tuner
        </button>
        )}
    </div>
  );
}

export default Tuner;