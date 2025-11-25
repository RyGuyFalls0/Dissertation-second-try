import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd"
import { useState, useEffect } from "react"
import LiveWaveform from "./Waveform";
import { sendEffectsData } from "./api.jsx"
function App() {
  // This list should be using a trait index that captures the position in the activeEffects stack, can be updated with .index 
  const effectsList = [
    { name: "Reverb", id: 0 },
    { name: "Gain", id: 1 },
    { name: "Delay", id: 2 },
    { name: "Distortion", id: 3 }
  ]

  // activeEffectsStructure = [
  //   {
  //     name: String, 
  //     position: Int (destination.index), 
  //     specifics: {e.g. gain: Int, }
  //   }
  // ]


  const [effects, setEffects] = useState(effectsList)
  const [activeEffects, setActiveEffects] = useState([])
  const [activeEffectsMetadata, setActiveEffectsMetadata] = useState({})

  useEffect(() => {
    sendEffectsData(activeEffectsMetadata);
}, [activeEffectsMetadata]);

  const handleDragDrop = (results) => {
    const {source, destination, type} = results;
    if (!destination) return;
    if (source.droppableId === destination.droppableId  && source.index === destination.index) return;

    if (source.droppableId === "oyster" && destination.droppableId === "activeEffects") {
      const reorderedActiveEffects = [...activeEffects]
      if (activeEffects.length >=5 ) {
        return;
      }
      // AI slop probably needs to be restructured
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
          specifics: []
      };
    });
    setActiveEffectsMetadata(newMetadata);
    setActiveEffects(reorderedActiveEffects);
    return;
    }

    // removing from active effects
    if (source.droppableId === "activeEffects" && destination.droppableId === "oyster") {
      const reorderedActiveEffects = [...activeEffects];
      reorderedActiveEffects.splice(source.index, 1);

      const newMetadata = {};
      reorderedActiveEffects.forEach((eff, index) => {
        newMetadata[eff.id] = {
          name: eff.name,
          position: index,
          specifics: activeEffectsMetadata[eff.id]?.specifics || []
        };
      });
    
      setActiveEffects(reorderedActiveEffects);
      setActiveEffectsMetadata(newMetadata);
      return;
    }
    // This section is for reordering within activeEffects
    if (source.droppableId === "activeEffects") {
      const reorderedActiveEffects = [...activeEffects];
      const [removedEffect] = reorderedActiveEffects.splice(source.index, 1);
      reorderedActiveEffects.splice(destination.index, 0, removedEffect);
      const newMetadata = {};
      reorderedActiveEffects.forEach((eff, index) => {
        newMetadata[eff.id] = {
          name: eff.name,
          position: index,
          specifics: activeEffectsMetadata[eff.id]?.specifics || []
        };
      });
      
      setActiveEffects(reorderedActiveEffects);
      setActiveEffectsMetadata(newMetadata);
      return;
      }
  }

  return (
  <div className="min-h-screen bg-white flex flex-col">
    {/* Header */}
    <header className="bg-gray-800 text-white flex justify-between items-center px-6 py-3">
      <h1 className="text-2xl font-bold">TBC</h1>
      <a href="#" className="text-sm hover:underline">
        Gitlab
      </a>
    </header>

    <div className="p-6 flex justify-center">
        <LiveWaveform />
      </div>

    {/* Main Content */}
    <main className="flex-1 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-8">Effects</h2>

      <div className="grid grid-cols-2 gap-12 w-full max-w-3xl">
        <DragDropContext onDragEnd={handleDragDrop}>
          {/* Oyster Section */}
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

          {/* Active Effects Section */}
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
        </DragDropContext>
      </div>
    </main>
  </div>
)};


  export default App;
