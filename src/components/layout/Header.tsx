'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from '@/components/auth/UserMenu'
import { APP_CONFIG, ROUTES } from '@/constants'

interface HeaderProps {
  className?: string
}

export default function Header({ className = '' }: HeaderProps) {
  const { user, isLoading } = useAuth()

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link href={ROUTES.HOME} className="text-2xl font-bold text-gray-900">
              {APP_CONFIG.NAME}
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              href={ROUTES.HOME}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              首页
            </Link>
            {user && (
              <Link
                href={ROUTES.DASHBOARD}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                仪表板
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  登录
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
