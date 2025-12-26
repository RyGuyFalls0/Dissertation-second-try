import { useState, useEffect, useRef } from "react";
import "./metronome.css";

const click1 = "/assets/Metronome_click_1.mp3";
const click2 = "/assets/Metronome_click_2.mp3";

function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [bpm, setBpm] = useState(100);
  const [beatsPerMeasure] = useState(4);

  const click1Audio = useRef(null);
  const click2Audio = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    click1Audio.current = new Audio(click1);
    click2Audio.current = new Audio(click2);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const playClick = () => {
    setCount((prevCount) => {
      const currentBeat = prevCount % beatsPerMeasure;
      if (currentBeat === 0) {
        click2Audio.current?.play();
      } else {
        click1Audio.current?.play();
      }
      return (prevCount + 1) % beatsPerMeasure;
    });
  };

  const handleBpmChange = (event) => {
    const newBpm = parseInt(event.target.value);
    setBpm(newBpm);
    if (isPlaying) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(playClick, (60 / newBpm) * 1000);
      setCount(0);
    }
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setCount(0);
      playClick(); 
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="metronome">
      <div className="bpm-slider">
        <p>{bpm} BPM</p>
        <input
          type="range"
          min="60"
          max="240"
          value={bpm}
          onChange={handleBpmChange}
        />
      </div>
      <button onClick={toggleMetronome}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  );
}

export default Metronome;