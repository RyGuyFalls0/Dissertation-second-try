import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd"
import { useState, useEffect } from "react"
import Carousel from "./Carousel";
import { sendEffectsData, getAudioList, setAudioIO } from "./api.jsx"
import EffectModal from "./EffectModal";

function App() {
  const effectsList = [
    { name: "Reverb", id: 0, specifics: {} },
    { name: "Chorus", id: 1, specifics: {} },
    { name: "Delay", id: 2, specifics: {}  },
    { name: "Distortion", id: 3, specifics: {} },
    { name: "WahWah", id: 4, specifics: {} },
  ]

  // not currently used, more for reference
  const effectsSpecs = {
    "Reverb": {"roomSize": 0.5, "damping": 0.5, "wetDryMix": 0.3},
    "Chorus": {"rate":1.7, "depth":0.8, "wetDryMix":1.0},
    "Delay": {"delayTime":0.5, "feedback":0.3, "wetDryMix":0.5},
    "Distortion": {"drive":0.5, "wetDryMix":1.0},
    "WahWah": {"frequency":800.0, "resonance":4.0, "wetDryMix":0.7},
  }

  const [effects, setEffects] = useState(effectsList)
  const [activeEffects, setActiveEffects] = useState([])
  const [activeEffectsMetadata, setActiveEffectsMetadata] = useState({})

  const [audioList, setAudioList] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Add these state variables for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState(null);

  useEffect(() => {
    sendEffectsData(activeEffectsMetadata);
  }, [activeEffectsMetadata]);

  useEffect(() => {
    fetchAudioList();
  }, []);

  const fetchAudioList = async () => {
    try {
      console.log("trying to get audio list in App.jsx");
      const data = await getAudioList();
      setAudioList(data);
    } catch (error) {
      console.error("Failed to load audio devices:", error);
    }
  };

  const handleEffectClick = (effect) => {
    const effectSpec = effectsSpecs[effect.name] || {};
    setSelectedEffect({
      ...effect,
      specifics: activeEffectsMetadata[effect.id]?.specifics || effectSpec
    });
    setIsModalOpen(true);
  };

  const handleRefreshDevices = async () => {
    setIsRefreshing(true);
    await fetchAudioList();
    setIsRefreshing(false);
};

  const handleSaveEffectValue = (effectId, value) => {
    setActiveEffectsMetadata(prev => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        specifics: value 
      }
    }));
  };

  const handleOutputDeviceChange = async (event) => {
    const selectedDevice = event.target.value;
    try {
      await setAudioIO({
        outputDevice: selectedDevice,
        inputDevice: audioList.currentInput
      });
    
      const updatedList = await getAudioList();
      setAudioList(updatedList);
    } catch (error) {
      console.error("Failed to change output device:", error);
    }
    };

    const handleInputDeviceChange = async (event) => {
    const selectedDevice = event.target.value;
    try {
      await setAudioIO({
        outputDevice: audioList.currentOutput,
        inputDevice: selectedDevice
      });
      
      const updatedList = await getAudioList();
      setAudioList(updatedList);
    } catch (error) {
      console.error("Failed to change output device:", error);
    }
    };

  const handleDragDrop = (results) => {
    const {source, destination, type} = results;
    if (!destination) return;
    if (source.droppableId === destination.droppableId  && source.index === destination.index) return;

    if (source.droppableId === "oyster" && destination.droppableId === "activeEffects") {
      const reorderedActiveEffects = [...activeEffects]
      if (activeEffects.length >=5 ) {
        return;
      }
      const effect = {
        ...structuredClone(effects[source.index]),
        id: `${effects[source.index].name}-${Math.random()}`
      };

      reorderedActiveEffects.splice(destination.index, 0, effect)
      const newMetadata = {};
      reorderedActiveEffects.forEach((eff, index) => {
        newMetadata[eff.id] = {
          name: eff.name,
          position: index,
          specifics: activeEffectsMetadata[eff.id]?.specifics || {}
      };
    });
    setActiveEffectsMetadata(newMetadata);
    setActiveEffects(reorderedActiveEffects);
    return;
    }

    if (source.droppableId === "activeEffects" && destination.droppableId === "oyster") {
      const reorderedActiveEffects = [...activeEffects];
      reorderedActiveEffects.splice(source.index, 1);

      const newMetadata = {};
      reorderedActiveEffects.forEach((eff, index) => {
        newMetadata[eff.id] = {
          name: eff.name,
          position: index,
          specifics: activeEffectsMetadata[eff.id]?.specifics || {}
        };
      });
    
      setActiveEffects(reorderedActiveEffects);
      setActiveEffectsMetadata(newMetadata);
      return;
    }

    if (source.droppableId === "activeEffects") {
      const reorderedActiveEffects = [...activeEffects];
      const [removedEffect] = reorderedActiveEffects.splice(source.index, 1);
      reorderedActiveEffects.splice(destination.index, 0, removedEffect);
      const newMetadata = {};
      reorderedActiveEffects.forEach((eff, index) => {
        newMetadata[eff.id] = {
          name: eff.name,
          position: index,
          specifics: activeEffectsMetadata[eff.id]?.specifics || {}
        };
      });
      
      setActiveEffects(reorderedActiveEffects);
      setActiveEffectsMetadata(newMetadata);
      return;
    }
  }
return (
  <div className="min-h-screen bg-white flex flex-col">
    <header className="bg-gray-800 text-white flex justify-between items-center px-6 py-3">
      <h1 className="text-2xl font-bold">TBC</h1>
      <a href="#" className="text-sm hover:underline">
        Gitlab
      </a>
    </header>

    <div>
      <Carousel />
    </div>

    <main className="flex-1 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-8">Effects</h2>

      <div className="grid grid-cols-2 gap-12 w-full max-w-3xl">
        <DragDropContext onDragEnd={handleDragDrop}>

          {/* LEFT COLUMN */}
          <div className="flex flex-col">
            <div className="bg-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center">
              <div className="card">
                <div className="header">
                  <h3 className="text-lg font-semibold mb-4">Oyster</h3>
                </div>

                <Droppable droppableId="oyster" type="effects">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col gap-2 rounded-xl p-4 transition-opacity duration-200 ${
                        snapshot.isDraggingOver
                          ? "opacity-70"
                          : "opacity-100 bg-gray-50"
                      }`}
                    >
                      {effects.map((effect, index) => (
                        <Draggable
                          draggableId={String(effect.name)}
                          key={effect.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md text-center cursor-grab"
                            >
                              {effect.name}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            {/* INPUT DEVICE */}
            <div className="mt-4">
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

            {/* RELOAD BUTTON */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleRefreshDevices}
                disabled={isRefreshing}
                className={`bg-white border-2 border-gray-300 rounded-full p-3 shadow-lg
                  hover:bg-gray-50 hover:border-gray-400 transition-all
                  ${isRefreshing ? 'animate-spin' : ''}
                `}
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
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col">
            <div className="bg-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center">
              <div className="card">
                <div className="header">
                  <h3 className="text-lg font-semibold mb-4">
                    Active Effects ({activeEffects.length}/5)
                  </h3>
                </div>

                <Droppable
                  droppableId="activeEffects"
                  type="effects"
                  isDropDisabled={activeEffects.length === 5}
                >
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-4 rounded-xl min-h-[200px] transition-colors duration-200 ${
                        snapshot.isDraggingOver
                          ? 'bg-blue-100'
                          : 'bg-gray-50'
                      }`}
                    >
                      {activeEffects.map((effect, index) => (
                        <Draggable
                          draggableId={String(effect.id)}
                          key={effect.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md text-center cursor-grab"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEffectClick(effect);
                              }}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span>{effect.name}</span>
                                <span className="text-gray-500 text-sm">▼</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            {/* OUTPUT DEVICE */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Device
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                onChange={handleOutputDeviceChange}
                value={audioList?.currentOutput || ''}
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

        </DragDropContext>
      </div>
    </main>

    {/* Add the modal component */}
    <EffectModal
      effect={selectedEffect}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSave={handleSaveEffectValue}
    />
  </div>
)};

export default App;