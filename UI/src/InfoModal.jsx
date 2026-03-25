import { useRef } from "react"
import React from "react"
import ReverbAnimation from "./canvas/ReverbAnimation"
import ChorusAnimation from "./canvas/ChorusAnimation"
import DistortionAnimation from "./canvas/DistortionAnimation"
import DelayAnimation from "./canvas/DelayAnimation"

const EFFECT_INFO = {
    Delay: {
        "name": "Delay",
        params: {
        "general": "Delay acts as an echo",
        "delay time": "This sets the length of time between the original sound and the echo being heard",
        "feedback": "How many times the echo will repeat, not that the echo will diminish slightly each time",
        "mix": "Controls the volume balance between the original sound (dry) and the echo (wet)"
        },
        animation: <DelayAnimation />
    },
    Reverb: {
        "name": "Reverb",
        params: {
        "general": "Reverb simulates natural reverberations like sounds bouncing off walls",
        "room size": "You got this one" ,
        "damping": "Dampening simulates the surface of reflection - high dampening simulates a surface like foam where high frequencies are absorbed more" ,
        "mix": "Controls the volume balance between the original sound (dry) and the modified signal (wet)"
        },
        animation: <ReverbAnimation />
    },
    Distortion: {
        "name": "Distortion",
        params: {
        "general": "Distortion clips a rounded (sine) waveform to flatten out its peaks and troughs turning the signal square-(ish)",
        "drive": "Amplifies the signal such that more parts of the signal are clipped",
        "mix": "Controls the volume balance between the original sound (dry) and the distorted one (wet)"
        },
        animation: <DistortionAnimation />
    },
    Chorus: {
        "name": "Chorus",
        params: {
        "default": "Chorus simulates multiple guitars by playing a slightly altered signal at a slight delay and oscillating around the original signal",
        "rate": "Rate sets how quickly the oscillation happens",
        "depth": "Depth defines how much the signal oscillates or how far out of tune the copies go." ,
        "mix": "Controls the volume balance between the original sound (dry) and the modified signal (wet)"
        },
        animation: <ChorusAnimation />
    },
    WahWah: {
        "name": "Wah Wah",
        params: {
        "general": "(Not operating)",
        "frequency": "",
        "resonance": "",
        "mix": ""
        }
    }
}

function InfoModal({ effect, isOpen, onClose}) {
    const modalRef = useRef(null);

    if (!isOpen || !effect) return null;
    const info = EFFECT_INFO[effect.name] || {}

return (
  <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center"
    onClick={onClose}>
     {info.animation && React.cloneElement(info.animation, { modal: modalRef })}
      <div
        ref={modalRef}
        className="border-2 border-black border-solid bg-white rounded-xl p-6 w-[28rem] shadow-2xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
      <h2 className="text-2xl font-bold mb-6 text-center">{effect.name}</h2>

      <div className="space-y-4">
        {Object.entries(info?.params).map(([paramName, paramValue]) => (
          <div key={paramName} className="grid grid-cols-[120px_1fr] gap-4">
            <span className="text-gray-800 font-semibold text-center whitespace-nowrap">
              {paramName}
            </span>

            <span className="text-gray-700 leading-relaxed">
              {paramValue}
            </span>

            <div className="col-span-2 border-b border-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default InfoModal