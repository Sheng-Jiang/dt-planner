'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { AuthProvider } from '@/contexts/AuthContext'

export default function DemoAuthPage() {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login')

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Forms Demo
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setActiveForm('login')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeForm === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Login Form
            </button>
            <button
              onClick={() => setActiveForm('register')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeForm === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Register Form
            </button>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {activeForm === 'login' ? (
              <LoginForm onSuccess={() => alert('Login successful!')} />
            ) : (
              <RegisterForm onSuccess={() => alert('Registration successful!')} />
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}