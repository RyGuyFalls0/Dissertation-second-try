import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd"
import { useState, useEffect } from "react"
import Carousel from "./Carousel";
import { sendEffectsData, getAudioList, setAudioIO, stopMicrophone, startMicrophone, applyMasterGain } from "./api.jsx"
import EffectModal from "./EffectModal";
import InfoModal from "./InfoModal.jsx";
import { MicOffImage, MicOnImage } from "./assets/micImages.jsx"; 
import BinIcon from "./assets/BinIcon.jsx"
import GainSlider from "./GainSlider.jsx";
import ChangeIO from "./ChangeIO.jsx"

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
    "Distortion": {"drive":5.0, "wetDryMix":1.0},
    "WahWah": {"frequency":800.0, "resonance":4.0, "wetDryMix":0.7},
  }

  const [effects, setEffects] = useState(effectsList)
  const [activeEffects, setActiveEffects] = useState([])
  const [activeEffectsMetadata, setActiveEffectsMetadata] = useState({})

  const [audioList, setAudioList] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isASIO, setIsASIO] = useState(true);
  
  
  // Modal State
  const [isEffectModalOpen, setisEffectModalOpen] = useState(false);
  const [isInfoModalOpen, setisInfoModalOpen] = useState(false);
  const [selectedActiveEffect, setSelectedActiveEffect] = useState(null);
  const [selectedInfoEffect, setSelectedInfoEffect] = useState(null);

  // Mic and Gain state
  const [micOn, setMicOn] = useState(true);
  const [masterGain, setMasterGain] = useState(20);


  useEffect(() => {
    sendEffectsData(activeEffectsMetadata);
  }, [activeEffectsMetadata]);

  useEffect(() => {
    fetchAudioList();
  }, []);

  useEffect(() => {
    setMasterGain();
  }, []);

  useEffect(() => {
  const handleKey = (e) => {
    if (e.key === '1') addEffectByKey(0);
    if (e.key === '2') addEffectByKey(1);
    if (e.key === '3') addEffectByKey(2);
    if (e.key === '4') addEffectByKey(3);
    if (e.key === '5') addEffectByKey(4);

    if (e.key.toLowerCase() === 'd') clearActiveEffects();
  };

  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
  }, [activeEffects, activeEffectsMetadata]);

  const addEffectByKey = (index) => {
  if (activeEffects.length >= 5) return;

  // Get effect from source list
  const baseEffect = effects[index];
  if (!baseEffect) return;

  const effect = {
    ...structuredClone(baseEffect),
    id: `${baseEffect.name}-${Math.random()}`
  };

  const updated = [...activeEffects, effect];

  // Rebuild metadata
  const newMetadata = {};
  updated.forEach((eff, i) => {
    newMetadata[eff.id] = {
      name: eff.name,
      position: i,
      specifics: activeEffectsMetadata[eff.id]?.specifics || {}
    };
  });

  setActiveEffects(updated);
  setActiveEffectsMetadata(newMetadata);
};


  const fetchAudioList = async () => {
    try {
      console.log("trying to get audio list in App.jsx");
      const data = await getAudioList();
      setAudioList(data);
    } catch (error) {
      console.error("Failed to load audio devices:", error);
    }
  };

  const handleActiveEffectClick = (effect) => {
    const effectSpec = effectsSpecs[effect.name] || {};
    setSelectedActiveEffect({
      ...effect,
      specifics: activeEffectsMetadata[effect.id]?.specifics || effectSpec
    });
    setisEffectModalOpen(true);
  };

  const handleInfoEffectClick = (effect) => {
    setSelectedInfoEffect({...effect})
    setisInfoModalOpen(true);
  }

  const handleRefreshDevices = async () => {
    setIsRefreshing(true);
    await fetchAudioList();
    await new Promise(resolve => setTimeout(resolve, 500)); // ensures the spin happens
    setIsRefreshing(false);
 };

  const handleChangeASIO = async () => {
    const newValue = !isASIO;

    try {
      await setASIOChange();
      await fetchAudioList();
      setIsASIO(newValue);
    } catch (err) {
      console.error("Toggle failed");
    }
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

  const handleMicChange = async () => {
    const response = await (micOn ? stopMicrophone() : startMicrophone());
    console.log(response)
    if (response === "success") {
      setMicOn(!micOn);
    }
    else {
      window.alert(response);
    }
  }

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
      if (isASIO) {
        await setAudioIO({
        outputDevice: selectedDevice,
        inputDevice: selectedDevice
      });
      }
      else {
        await setAudioIO({
          outputDevice: audioList.currentOutput,
          inputDevice: selectedDevice
        });
      }
      
      const updatedList = await getAudioList();
      setAudioList(updatedList);
    } catch (error) {
      console.error("Failed to change output device:", error);
    }
    };

    const handleMasterGainChange = async (gain) => {
      setMasterGain(gain);
      const gainDb = -60 + (gain*1.5 / 100) * 72;
      const res = await applyMasterGain(gainDb);
      if (res === "success") return;
      console.log(res);
    }

    const clearActiveEffects = () => {
      setActiveEffects([]);
      setActiveEffectsMetadata({});
    };

  const handleDragDrop = (results) => {
    const {source, destination, _} = results;
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
      <h1 className="text-4xl font-bold">TBC</h1>
      <a href="https://github.com/RyGuyFalls0/Dissertation-second-try" className="text-2xl hover:underline">
        Github
      </a>
    </header>
    <div className="flex flex-col items-center w-full gap-8">
    <div className="mt-10 w-full">
      <Carousel />
    </div>

    <div className="w-full flex items-center justify-center">
      <div 
        onClick={() => handleMicChange()}
        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer 
                    ${micOn ? "bg-green-200" : "bg-red-500"}`}
      >
        {micOn ? <MicOnImage /> : <MicOffImage />}
      </div>
    </div>
    </div>
  <main className="flex-1 flex flex-col items-center justify-center p-2">

  <h2 className="text-3xl font-bold mb-4">Effects</h2>
  <div className= "grid grid-cols-[1fr_2fr_2fr_1fr] gap-6 w-full max-w-6xl mx-auto items-start "> 
  <GainSlider gain={masterGain} setGain={handleMasterGainChange} />
  <DragDropContext onDragEnd={handleDragDrop}>

        {/* OYSTER COLUMN */}
        <div className="flex flex-col gap-2 rounded-xl p-4 transition-opacity duration-200 min-h-[250px] w-full">
          <div className="h-full bg-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center">
            <div className="card">
              <div className="header">
                <h3 className="text-lg font-semibold mb-4 center">Oyster</h3>
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
                            className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 pl-2 pr-4 rounded-md cursor-grab flex items-center justify-between"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInfoEffectClick(effect);
                            }}
                          >
                            <span className="text-gray-400 opacity-50 text-xs">{index + 1}&nbsp;</span>
                            <span>{effect.name}</span>
                            <span className="opacity-0 text-xs">{index + 1}</span>
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
        </div>

        {/* ACTIVE EFFECTS COLUMN */}
        <div className="flex flex-col gap-2 rounded-xl p-4 transition-opacity h-full duration-200 min-h-[250px] w-full">
          <div className="h-full bg-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center">
            <div className="card">
              <div className="header relative w-full flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-center flex-1">
                  Active Effects ({activeEffects.length}/5)
                </h3>

                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-red-600 transition-colors"
                  onClick={clearActiveEffects}
                >
                  <BinIcon />
                </button>
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
                    className={`flex flex-col gap-2 p-4 rounded-xl min-h-[200px] transition-colors duration-200 ${
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
                            className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md text-center cursor-grab"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActiveEffectClick(effect);
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

    </div>
  </DragDropContext>
  <GainSlider gain={masterGain} setGain={handleMasterGainChange} />
  </div>

        <ChangeIO
          audioList={audioList}
          isRefreshing={isRefreshing}
          handleInputDeviceChange={handleInputDeviceChange}
          handleRefreshDevices={handleRefreshDevices}
          handleOutputDeviceChange={handleOutputDeviceChange}
          isASIO={isASIO}
          changeASIO={handleChangeASIO}
        />
  </main>


    <EffectModal
      effect={selectedActiveEffect}
      isOpen={isEffectModalOpen}
      onClose={() => setisEffectModalOpen(false)}
      onSave={handleSaveEffectValue}
    />

    <InfoModal
    effect={selectedInfoEffect}
    isOpen={isInfoModalOpen}
    onClose={() => setisInfoModalOpen(false)}
    />
  </div>
)};


export default App;