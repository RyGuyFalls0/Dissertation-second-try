export default function ChangeIO ({
  audioList,
  isRefreshing,
  handleInputDeviceChange,
  handleRefreshDevices,
  handleOutputDeviceChange,
  isASIO,
  onToggleDriver
}) {

  return (
    <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mt-8">

      {/* INPUT */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Device
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
          onChange={handleInputDeviceChange}
          value={audioList?.currentInput || ''}
        >
          {audioList?.status === 'success' ? (
            <>
              <option value={audioList.currentInput}>
                {audioList.currentInput} (Current)
              </option>
              {audioList.inputDevices
                ?.filter(d => d !== audioList.currentInput)
                .map((device, index) => (
                  <option key={index} value={device}>
                    {device}
                  </option>
                ))}
            </>
          ) : (
            <option>Loading devices...</option>
          )}
        </select>
      </div>


      {/* CENTER COLUMN */}
      <div className="flex flex-col items-center justify-end relative">

        {/* TOGGLE */}
        <div className="relative group mb-4">

          {/* Hover text */}
          <div className="
            absolute -top-8 left-1/2 -translate-x-1/2
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            bg-gray-800 text-white text-xs px-2 py-1 rounded
            whitespace-nowrap
          ">
            {isASIO ? "Deactivate ASIO (performance drops)" : "Activate ASIO (performance improves)"}
          </div>

          {/* Toggle switch */}
          <button
            onClick={onToggleDriver}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300
              ${isASIO ? 'bg-green-500' : 'bg-gray-400'}
            `}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300
                ${isASIO ? 'translate-x-7' : 'translate-x-0'}
              `}
            />
          </button>

        </div>


        {/* REFRESH BUTTON */}
        <button
          onClick={handleRefreshDevices}
          disabled={isRefreshing}
          className="bg-white border-2 border-gray-300 rounded-full p-3 shadow-lg
            hover:bg-gray-50 hover:border-gray-400 transition-all"
          title="Refresh audio devices"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${isRefreshing ? 'animate-spin' : ''}`}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>

      </div>


      {/* OUTPUT */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Device
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
          onChange={handleOutputDeviceChange}
          value={audioList?.currentOutput || ''}
          disabled={isASIO}
        >
          {audioList?.status === 'success' ? (
            <>
              <option value={audioList.currentOutput}>
                {audioList.currentOutput} (Current)
              </option>
              {audioList.outputDevices
                ?.filter(d => d !== audioList.currentOutput)
                .map((device, index) => (
                  <option key={index} value={device}>
                    {device}
                  </option>
                ))}
            </>
          ) : (
            <option>Loading devices...</option>
          )}
        </select>
      </div>

    </div>
  );
}