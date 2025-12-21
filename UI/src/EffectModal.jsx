import { useState, useEffect } from "react";

function EffectModal({ effect, isOpen, onClose, onSave }) {
  const [value, setValue] = useState(0.5);

  useEffect(() => {
    // Initialize with existing value if available
    if (effect?.specifics?.value !== undefined) {
      setValue(effect.specifics.value);
    } else {
      setValue(0.5);
    }
  }, [effect]);

  if (!isOpen || !effect) return null;

  const handleSave = () => {
    onSave(effect.id, value);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{effect.name}</h2>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Value</span>
            <span className="text-sm font-semibold">{value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>1</span>
          </div>
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