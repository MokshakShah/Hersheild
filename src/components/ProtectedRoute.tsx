"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

        useEffect(() => {
          if (!loading && !user) {
            // Store last attempted path for redirect after login
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('hersheild-last-path', window.location.pathname + window.location.search)
              sessionStorage.setItem('hersheild-session-expired', '1')
            }
            router.push('/login')
          }
        }, [user, loading, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, don't render children
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
