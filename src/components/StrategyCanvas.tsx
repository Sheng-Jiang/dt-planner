'use client'

import { useState, useRef, useCallback } from 'react'
import { CompanyObjective } from '@/types/strategy'

interface StrategyCanvasProps {
  objectives: CompanyObjective[]
  onUpdateObjective: (id: string, updates: Partial<CompanyObjective>) => void
  onDeleteObjective: (id: string) => void
}

export default function StrategyCanvas({
  objectives,
  onUpdateObjective,
  onDeleteObjective,
}: StrategyCanvasProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent, objectiveId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setDraggedItem(objectiveId)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedItem || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newPosition = {
        x: e.clientX - canvasRect.left - dragOffset.x,
        y: e.clientY - canvasRect.top - dragOffset.y,
      }

      onUpdateObjective(draggedItem, { position: newPosition })
    },
    [draggedItem, dragOffset, onUpdateObjective]
  )

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-4 text-center text-gray-400 pointer-events-none">
        {objectives.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-lg">Start by adding objectives from the palette</p>
              <p className="text-sm mt-2">
                Click on objectives from the left panel to add them to your strategy canvas
              </p>
            </div>
          </div>
        )}
      </div>

      {objectives.map(objective => (
        <div
          key={objective.id}
          className="absolute cursor-move select-none"
          style={{
            left: objective.position.x,
            top: objective.position.y,
            transform: draggedItem === objective.id ? 'scale(1.05)' : 'scale(1)',
            zIndex: draggedItem === objective.id ? 10 : 1,
          }}
          onMouseDown={e => handleMouseDown(e, objective.id)}
        >
          <div
            className={`bg-white border-2 rounded-lg p-4 shadow-lg max-w-xs ${
              draggedItem === objective.id ? 'border-blue-500 shadow-xl' : 'border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-3xl">{objective.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{objective.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{objective.description}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      objective.category === 'growth'
                        ? 'bg-green-100 text-green-800'
                        : objective.category === 'efficiency'
                          ? 'bg-blue-100 text-blue-800'
                          : objective.category === 'innovation'
                            ? 'bg-purple-100 text-purple-800'
                            : objective.category === 'customer'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {objective.category}
                  </span>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation()
                  onDeleteObjective(objective.id)
                }}
                className="text-red-500 hover:text-red-700 ml-2 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}

      {objectives.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">Strategy Summary</div>
            <div className="space-y-1">
              <div>Total Objectives: {objectives.length}</div>
              <div className="flex space-x-4 text-xs">
                <span className="text-green-600">
                  Growth: {objectives.filter(o => o.category === 'growth').length}
                </span>
                <span className="text-blue-600">
                  Efficiency: {objectives.filter(o => o.category === 'efficiency').length}
                </span>
                <span className="text-purple-600">
                  Innovation: {objectives.filter(o => o.category === 'innovation').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
