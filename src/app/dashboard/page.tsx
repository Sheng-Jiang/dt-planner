'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import { useState } from 'react'
import { CompanyObjective } from '@/types/strategy'
import StrategyCanvas from '@/components/StrategyCanvas'
import ObjectivePalette from '@/components/ObjectivePalette'
import UserMenu from '@/components/auth/UserMenu'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const [objectives, setObjectives] = useState<CompanyObjective[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const { user } = useAuth()

  const handleAddObjective = (objective: Omit<CompanyObjective, 'id' | 'position'>) => {
    const newObjective: CompanyObjective = {
      ...objective,
      id: Date.now().toString(),
      position: { x: 200, y: 200 },
    }
    setObjectives([...objectives, newObjective])
  }

  const handleUpdateObjective = (id: string, updates: Partial<CompanyObjective>) => {
    setObjectives(objectives.map(obj => (obj.id === id ? { ...obj, ...updates } : obj)))
  }

  const handleDeleteObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id))
  }

  const handleGenerateRecommendations = () => {
    setShowRecommendations(true)
  }

  if (showRecommendations) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Digital Transformation Recommendations
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Back to Strategy Canvas
                </button>
                <UserMenu />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Infrastructure Platform</h2>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm">☁️</span>
                      </div>
                      <h3 className="font-medium">Cloud-First Architecture</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Scalable cloud infrastructure with auto-scaling and global distribution
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm">🔒</span>
                      </div>
                      <h3 className="font-medium">Security Framework</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Zero-trust security model with identity management
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Data & Analytics Platform</h2>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm">📊</span>
                      </div>
                      <h3 className="font-medium">Data Lake & Warehouse</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Unified data platform for structured and unstructured data
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                      <h3 className="font-medium">AI/ML Pipeline</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Automated machine learning and predictive analytics
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Application Platform</h2>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <h3 className="font-medium">Mobile-First Applications</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cross-platform mobile apps with offline capabilities
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm">🔌</span>
                      </div>
                      <h3 className="font-medium">API Gateway</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Centralized API management and microservices architecture
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Implementation Roadmap</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <span className="text-sm">
                      Phase 1: Cloud Infrastructure Setup (3-6 months)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      2
                    </div>
                    <span className="text-sm">
                      Phase 2: Data Platform Implementation (6-9 months)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                      3
                    </div>
                    <span className="text-sm">
                      Phase 3: Application Modernization (9-12 months)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <ObjectivePalette onAddObjective={handleAddObjective} />

          <div className="flex-1 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Company Strategy Canvas</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGenerateRecommendations}
                    disabled={objectives.length === 0}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Generate Recommendations
                  </button>
                  <UserMenu />
                </div>
              </div>

              <StrategyCanvas
                objectives={objectives}
                onUpdateObjective={handleUpdateObjective}
                onDeleteObjective={handleDeleteObjective}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
