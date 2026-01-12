import { useState, useEffect } from "react";

// Default parameter configurations for each effect
const EFFECT_PARAMS = {
  Delay: {
    delayTime: { label: "Delay Time", min: 0, max: 2, step: 0.01, default: 0.5, unit: "s" },
    feedback: { label: "Feedback", min: 0, max: 0.95, step: 0.01, default: 0.3, unit: "" },
    wetDryMix: { label: "Mix", min: 0, max: 1, step: 0.01, default: 0.5, unit: "" }
  },
  Reverb: {
    roomSize: { label: "Room Size", min: 0, max: 1, step: 0.01, default: 0.5, unit: "" },
    damping: { label: "Damping", min: 0, max: 1, step: 0.01, default: 0.5, unit: "" },
    wetDryMix: { label: "Mix", min: 0, max: 1, step: 0.01, default: 0.3, unit: "" }
  },
  Distortion: {
    drive: { label: "Drive", min: 0, max: 1, step: 0.01, default: 0.5, unit: "" },
    wetDryMix: { label: "Mix", min: 0, max: 1, step: 0.01, default: 0.8, unit: "" }
  },
  Chorus: {
    rate: { label: "Rate", min: 0.1, max: 10, step: 0.1, default: 1.5, unit: "Hz" },
    depth: { label: "Depth", min: 0, max: 1, step: 0.01, default: 0.5, unit: "" },
    wetDryMix: { label: "Mix", min: 0, max: 1, step: 0.01, default: 0.5, unit: "" }
  },
  WahWah: {
    frequency: { label: "Frequency", min: 100, max: 5000, step: 1, default: 800, unit: "Hz" },
    resonance: { label: "Resonance", min: 0.5, max: 20, step: 0.1, default: 4.0, unit: "Q" },
    wetDryMix: { label: "Mix", min: 0, max: 1, step: 0.01, default: 0.7, unit: "" }
  },
};

function EffectModal({ effect, isOpen, onClose, onSave }) {
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    if (!effect) return;

    const effectParams = EFFECT_PARAMS[effect.name] || {};
    const initialParams = {};

    // Initialize with existing values or defaults
    Object.keys(effectParams).forEach((paramName) => {
      const paramConfig = effectParams[paramName];
      initialParams[paramName] = 
        effect.specifics?.[paramName] ?? paramConfig.default;
    });

    setParameters(initialParams);
  }, [effect]);

  if (!isOpen || !effect) return null;

  const effectParams = EFFECT_PARAMS[effect.name] || {};

  const handleSave = () => {
    onSave(effect.id, parameters);
    onClose();
  };

  const updateParameter = (paramName, value) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: parseFloat(value)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{effect.name}</h2>
        
        <div className="space-y-5 mb-6">
          {Object.entries(effectParams).map(([paramName, config]) => (
            <div key={paramName}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">{config.label}</span>
                <span className="text-sm font-semibold">
                  {parameters[paramName]?.toFixed(2)}{config.unit}
                </span>
              </div>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={parameters[paramName] ?? config.default}
                onChange={(e) => updateParameter(paramName, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{config.min}{config.unit}</span>
                <span>{config.max}{config.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EffectModal;