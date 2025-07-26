'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from '@/components/auth/UserMenu'

export default function Home() {
  const { user, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                DT Planner
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Visualize Your Digital</span>
              <span className="block text-primary-600">Transformation Strategy</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Our interactive canvas helps you map out your company&apos;s objectives and provides
              tailored recommendations for digital transformation platforms.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href={user ? '/dashboard' : '/register'}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Key Features</h2>
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-1 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Interactive Canvas</h3>
              <p className="mt-2 text-base text-gray-500">
                Drag and drop your strategic objectives on our intuitive canvas.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Tailored Recommendations</h3>
              <p className="mt-2 text-base text-gray-500">
                Receive platform suggestions based on your unique strategy.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Implementation Roadmap</h3>
              <p className="mt-2 text-base text-gray-500">
                Get a clear, phased roadmap to guide your transformation journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
