import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Digital Transformation Planner',
  description: 'Strategic planning tool for digital transformation initiatives',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  )
}
