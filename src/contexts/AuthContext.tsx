"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { evidenceService } from '@/services/evidence'

interface User {
  id: string
  name: string
  phoneNumber: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phoneNumber: string, password: string) => Promise<boolean>
  signup: (name: string, phoneNumber: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const checkAuth = async () => {
    try {
      // console.log('Checking auth status...')
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        // console.log('Auth successful:', data.user)
        setUser(data.user)
        // Set per-user key for evidence storage
        // evidenceService.setUserKey(data.user?.id)
      } else {
        console.log('Auth failed, status:', response.status)
        setUser(null)
        evidenceService.setUserKey(null)
        // If token is invalid, clear any existing cookies
        if (response.status === 401) {
          document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }

  useEffect(() => {
    // console.log('AuthProvider mounted, checking auth...')
    // Only check auth if we're not on login/signup pages
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname === '/login' || pathname === '/signup') {
        setLoading(false);
        setInitialized(true);
        return;
      }
    }
    // Immediate auth check for faster response
    checkAuth();
  }, [])

  // Set up periodic auth check to handle token expiration (less frequent for better performance)
  useEffect(() => {
    if (user) {
      const interval = setInterval(checkAuth, 10 * 60 * 1000) // Check every 10 minutes instead of 5
      return () => clearInterval(interval)
    }
  }, [user])

  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Login successful:', data.user)
        setUser(data.user)
        evidenceService.setUserKey(data.user?.id)
        toast({
          title: "Success!",
          description: "Logged in successfully.",
        })
        console.log('Toast shown, preparing to redirect...')
        // Small delay to show toast, then redirect
        setTimeout(() => {
          console.log('Redirecting to /...')
          window.location.href = '/'
        }, 1000)
        return true
      } else {
        console.log('Login failed:', data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to login",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const signup = async (name: string, phoneNumber: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting signup...')
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Signup successful:', data.user)
        setUser(data.user)
        evidenceService.setUserKey(data.user?.id)
        toast({
          title: "Success!",
          description: "Account created successfully. You are now logged in.",
        })
        // Small delay to show toast, then redirect
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
        return true
      } else {
        console.log('Signup failed:', data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to create account",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = async () => {
    try {
      console.log('Attempting logout...')
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        console.log('Logout successful')
        setUser(null)
        // Clear active user key so evidence is not shared
        evidenceService.setUserKey(null)
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        })
        router.push('/login')
      } else {
        console.log('Logout failed')
        toast({
          title: "Error",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuth,
  }

  // Don't render children until context is initialized
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider')
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
