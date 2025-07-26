/**
 * User authentication types and interfaces
 */

export interface User {
  id: string
  email: string
  createdAt: string
  lastLoginAt: string
}

export interface UserRecord extends User {
  passwordHash: string
  resetToken?: string
  resetTokenExpiry?: string
}

export interface AuthError {
  error: string
  message: string
  statusCode: number
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, confirmPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (token: string, newPassword: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
