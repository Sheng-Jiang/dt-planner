/**
 * 应用常量定义
 */

// API 端点
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  STRATEGY: {
    OBJECTIVES: '/api/strategy/objectives',
    CANVAS: '/api/strategy/canvas',
  },
} as const

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const

// 策略目标类别
export const OBJECTIVE_CATEGORIES = {
  GROWTH: 'growth',
  EFFICIENCY: 'efficiency',
  INNOVATION: 'innovation',
  CUSTOMER: 'customer',
  RISK: 'risk',
} as const

// 策略目标类别标签
export const OBJECTIVE_CATEGORY_LABELS = {
  [OBJECTIVE_CATEGORIES.GROWTH]: '增长',
  [OBJECTIVE_CATEGORIES.EFFICIENCY]: '效率',
  [OBJECTIVE_CATEGORIES.INNOVATION]: '创新',
  [OBJECTIVE_CATEGORIES.CUSTOMER]: '客户',
  [OBJECTIVE_CATEGORIES.RISK]: '风险',
} as const

// 策略目标类别颜色
export const OBJECTIVE_CATEGORY_COLORS = {
  [OBJECTIVE_CATEGORIES.GROWTH]: 'bg-green-100 text-green-800',
  [OBJECTIVE_CATEGORIES.EFFICIENCY]: 'bg-blue-100 text-blue-800',
  [OBJECTIVE_CATEGORIES.INNOVATION]: 'bg-purple-100 text-purple-800',
  [OBJECTIVE_CATEGORIES.CUSTOMER]: 'bg-orange-100 text-orange-800',
  [OBJECTIVE_CATEGORIES.RISK]: 'bg-red-100 text-red-800',
} as const

// 应用配置
export const APP_CONFIG = {
  NAME: 'DT Planner',
  DESCRIPTION: '数字化转型策略规划工具',
  VERSION: '1.0.0',
  AUTHOR: 'DT Team',
} as const

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'dt_planner_auth_token',
  USER_PREFERENCES: 'dt_planner_user_preferences',
  CANVAS_STATE: 'dt_planner_canvas_state',
} as const
