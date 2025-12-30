import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd"
import { useState, useEffect } from "react"
import Carousel from "./Carousel";
import { sendEffectsData, getAudioList } from "./api.jsx"
import EffectModal from "./EffectModal";

function App() {
  const effectsList = [
    { name: "Reverb", id: 0, specifics: {} },
    { name: "Chorus", id: 1, specifics: {} },
    { name: "Delay", id: 2, specifics: {}  },
    { name: "Distortion", id: 3, specifics: {} }
  ]

  // not currently used, more for reference
  const effectsSpecs = {
    "Reverb": {"roomSize": 0.5, "damping": 0.5, "wetDryMix": 0.3},
    "Chorus": {"rate":1.7, "depth":0.8, "wetDryMix":1.0},
    "Delay": {"delayTime":0.5, "feedback":0.3, "wetDryMix":0.5},
    "Distortion": {"drive":0.5, "wetDryMix":1.0},
  }

  const [effects, setEffects] = useState(effectsList)
  const [activeEffects, setActiveEffects] = useState([])
  const [activeEffectsMetadata, setActiveEffectsMetadata] = useState({})

  const [audioList, setAudioList] = useState({})
  
  // Add these state variables for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState(null);

  useEffect(() => {
    sendEffectsData(activeEffectsMetadata);
  }, [activeEffectsMetadata]);

  useEffect(() => {
    (async () => {
      try {
        console.log("tring to get audio list in App.jsx")
        const data = await getAudioList();
        setAudioList(data);
      } catch (error) {
        console.error("Failed to load audio devices:", error);
      }
    })();
  }, []);

  const handleEffectClick = (effect) => {
    const effectSpec = effectsSpecs[effect.name] || {};
    setSelectedEffect({
      ...effect,
      specifics: activeEffectsMetadata[effect.id]?.specifics || effectSpec
    });
    setIsModalOpen(true);
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
      
      // Optionally refresh the audio list to confirm the change
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

    <div >
        <Carousel />
      </div>

    <main className="flex-1 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-8">Effects</h2>

      <div className="grid grid-cols-2 gap-12 w-full max-w-3xl">
        <DragDropContext onDragEnd={handleDragDrop}>
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
                      snapshot.isDraggingOver ? "opacity-70" : "opacity-100 bg-gray-50"
                    }`}
                  >
                    {effects.map((effect, index) => (
                      <Draggable draggableId={String(effect.name)} key={effect.id} index={index}>
                        {(provided) => (
                          <div
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <div className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md text-center cursor-grab">
                              {effect.name}
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Device
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white">
                <option>Default Input</option>
                <option>Microphone 1</option>
                <option>Microphone 2</option>
                <option>Line In</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center">
              <div className="card">
                <div className="header">
                  <h3 className="text-lg font-semibold mb-4">Active Effects ({activeEffects.length}/5)</h3>
                </div>
                <Droppable droppableId="activeEffects" type="effects"  isDropDisabled={activeEffects.length == 5}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-4 rounded-xl min-h-[200px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-gray-50'
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
                              className={`rounded-lg transition-colors ${
                              snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-transparent'
                              }`}
                            >
                              {/* Add onClick handler here */}
                              <div 
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Device
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                onChange={handleOutputDeviceChange}
                value={audioList?.currentOutput || ''}
              >
                {audioList?.status === 'success' ? (
                  <>
                    <option value={audioList.currentOutput} selected>
                      {audioList.currentOutput} (Current)
                    </option>
                    
                    {audioList.outputDevices
                      ?.filter(device => device !== audioList.currentOutput)
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