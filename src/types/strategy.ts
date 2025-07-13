export interface CompanyObjective {
  id: string
  title: string
  description: string
  icon: string
  position: { x: number; y: number }
  category: 'growth' | 'efficiency' | 'innovation' | 'customer' | 'operations'
}

export interface DigitalTransformationTemplate {
  id: string
  name: string
  description: string
  infrastructure: InfrastructurePlatform[]
  dataProcessing: DataPlatform[]
  applications: ApplicationPlatform[]
  recommendedFor: string[]
}

export interface InfrastructurePlatform {
  id: string
  name: string
  type: 'cloud' | 'hybrid' | 'onPremise'
  description: string
  icon: string
}

export interface DataPlatform {
  id: string
  name: string
  type: 'analytics' | 'warehouse' | 'lake' | 'streaming'
  description: string
  icon: string
}

export interface ApplicationPlatform {
  id: string
  name: string
  type: 'web' | 'mobile' | 'api' | 'integration'
  description: string
  icon: string
}