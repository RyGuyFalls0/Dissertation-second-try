export default function GainSlider ({ gain, setGain }) {
    const lightness = 40 - gain * 28
    return (
    <div className=" h-full w-full rounded-lg grid place-items-center place-content-center">
            <div className="relative h-64 w-10 bg-gray-300 rounded-lg">
            <div
                className="absolute bottom-0 w-full bg-gray-600 rounded-lg"
                style={{ height: `${gain * 100}%`,
                         backgroundColor: `hsl(0, 100%, ${lightness}%)` }}
            />
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={gain}
                onChange={(e) => {setGain(+e.target.value)}}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
            />
            </div>
    </div>
    )
}