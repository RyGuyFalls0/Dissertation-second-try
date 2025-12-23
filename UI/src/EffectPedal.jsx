import React, { useState, useRef } from 'react';
import { Info, X } from 'lucide-react';

const GuitarPedal = () => {
  const [isOn, setIsOn] = useState(false);
  const [sustain, setSustain] = useState(50);
  const [volume, setVolume] = useState(70);

  const Knob = ({ value, onChange, label }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const startY = useRef(0);
    const startValue = useRef(0);
    const draggingRef = useRef(false);
    const inputRef = useRef(null);

    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;

      const deltaY = startY.current - e.clientY;
      const sensitivity = 0.5;
      const newValue = Math.min(100, Math.max(0, startValue.current + deltaY * sensitivity));
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = (e) => {
      if (isEditing) return;
      draggingRef.current = true;
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = value;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const handleTooltipClick = (e) => {
      e.stopPropagation();
      setIsEditing(true);
      setInputValue(value.toString());
      setTimeout(() => inputRef.current?.select(), 0);
    };

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue)) {
        onChange(Math.min(100, Math.max(0, numValue)));
      }
      setIsEditing(false);
    };

    const handleInputKeyDown = (e) => {
      if (e.key === 'Enter') {
        inputRef.current?.blur();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    };

    const showTooltip = isHovered || isDragging || isEditing;

    // Calculate angle (0-270 degrees range, starting from top)
    const angle = (value / 100) * 270 - 135; // -135 to +135 degrees
    const angleRad = (angle * Math.PI) / 180;

    // Position nipple on circle circumference
    const radius = 32; // Distance from center to nipple
    const nippleX = 40 + radius * Math.sin(angleRad);
    const nippleY = 40 - radius * Math.cos(angleRad);

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-3">
          <div
            className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-lg cursor-pointer select-none"
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Nipple indicator */}
            <div
              className="absolute w-3 h-3 bg-gray-700 rounded-full shadow-md pointer-events-none"
              style={{
                left: `${nippleX}px`,
                top: `${nippleY}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Value tooltip */}
          <div
            className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-opacity ${showTooltip ? 'opacity-100' : 'opacity-0'
              }`}
            onClick={handleTooltipClick}
            style={{ pointerEvents: showTooltip ? 'auto' : 'none', cursor: 'pointer' }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="bg-transparent text-white text-xs text-center outline-none w-8"
                style={{ caretColor: 'white' }}
              />
            ) : (
              value
            )}
          </div>
        </div>
        <span className="text-gray-200 font-medium text-sm">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
      <div className="relative w-80 bg-gradient-to-b from-gray-700 to-gray-800 rounded-3xl shadow-2xl p-6 border-4 border-gray-600">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Toggle Switch */}
          <button
            onClick={() => setIsOn(!isOn)}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isOn ? 'bg-blue-500' : 'bg-gray-500'
              }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isOn ? 'translate-x-9' : 'translate-x-1'
                }`}
            />
          </button>

          {/* Info Button */}
          <button className="text-gray-300 hover:text-white transition-colors">
            <Info size={24} />
          </button>

          {/* Title */}
          <h2 className="text-white font-bold text-lg">GTR Squeeze</h2>

          {/* Close Button */}
          <button className="text-gray-300 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Knobs Section */}
        <div className="flex justify-around mb-8 mt-8">
          <Knob value={sustain} onChange={setSustain} label="Sustain" />
          <Knob value={volume} onChange={setVolume} label="Volume" />
        </div>
      </div>
    </div>
  );
};

export default GuitarPedal;