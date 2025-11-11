import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd"
import { useState } from "react"
function App() {
  const effectsList = [
    { name: "Reverb", id: 0 },
    { name: "Gain", id: 1 },
    { name: "Delay", id: 2 },
    { name: "Distortion", id: 3 }
  ]
  const nextID = 10;

  const [effects, setEffects] = useState(effectsList)
  const [activeEffects, setActiveEffects] = useState([])

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
      const Effect = {
        ...structuredClone(effects[source.index]),
        id: `${effects[source.index].name}-${Date.now()}-${Math.random()}`
      };
      reorderedActiveEffects.splice(destination.index, 0, Effect)
      return setActiveEffects(reorderedActiveEffects)
    }

    if (type === 'order') {
      const reorderedEffects = [...effects]
      const [removedEffect] = reorderedEffects.splice(source.index, 1)
      reorderedEffects.splice(destination.index, 0, removedEffect)
      return setEffects(reorderedEffects)
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
              <Droppable droppableId="oyster" type="order" isDropDisabled={true}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {effects.map((effect, index) => (
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
                          >
                            <div className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md">
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
              <Droppable droppableId="activeEffects" type="order">
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
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
                            <div className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-md">
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
