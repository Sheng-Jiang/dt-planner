'use client'

import { CompanyObjective } from '@/types/strategy'

interface ObjectivePaletteProps {
  onAddObjective: (objective: Omit<CompanyObjective, 'id' | 'position'>) => void
}

const objectiveTemplates = [
  {
    title: 'Increase Revenue',
    description: 'Drive revenue growth through new channels',
    icon: '💰',
    category: 'growth' as const,
  },
  {
    title: 'Improve Efficiency',
    description: 'Optimize operational processes',
    icon: '⚡',
    category: 'efficiency' as const,
  },
  {
    title: 'Digital Innovation',
    description: 'Embrace emerging technologies',
    icon: '🚀',
    category: 'innovation' as const,
  },
  {
    title: 'Customer Experience',
    description: 'Enhance customer satisfaction',
    icon: '😊',
    category: 'customer' as const,
  },
  {
    title: 'Market Expansion',
    description: 'Enter new markets and segments',
    icon: '🌍',
    category: 'growth' as const,
  },
  {
    title: 'Cost Reduction',
    description: 'Reduce operational costs',
    icon: '📉',
    category: 'efficiency' as const,
  },
  {
    title: 'Data-Driven Decisions',
    description: 'Leverage analytics for insights',
    icon: '📊',
    category: 'innovation' as const,
  },
  {
    title: 'Automation',
    description: 'Automate repetitive processes',
    icon: '🤖',
    category: 'operations' as const,
  },
  {
    title: 'Security Enhancement',
    description: 'Strengthen cybersecurity posture',
    icon: '🔒',
    category: 'operations' as const,
  },
  {
    title: 'Employee Productivity',
    description: 'Boost workforce efficiency',
    icon: '👥',
    category: 'operations' as const,
  },
]

export default function ObjectivePalette({ onAddObjective }: ObjectivePaletteProps) {
  return (
    <div className="w-80 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Strategy Objectives</h2>
        <p className="text-sm text-gray-600 mt-1">Drag objectives to the canvas</p>
      </div>

      <div className="p-4 space-y-3">
        {objectiveTemplates.map((template, index) => (
          <div
            key={index}
            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            onClick={() => onAddObjective(template)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{template.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 text-sm">{template.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                    template.category === 'growth'
                      ? 'bg-green-100 text-green-800'
                      : template.category === 'efficiency'
                        ? 'bg-blue-100 text-blue-800'
                        : template.category === 'innovation'
                          ? 'bg-purple-100 text-purple-800'
                          : template.category === 'customer'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {template.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
