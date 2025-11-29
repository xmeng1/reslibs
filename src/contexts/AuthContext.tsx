'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  name?: string
  role: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储中的token
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
        setToken(token)
      } else {
        localStorage.removeItem('admin_token')
      }
    } catch (error) {
      console.error('Token验证失败:', error)
      localStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
        setToken(data.data.token)
        localStorage.setItem('admin_token', data.data.token)
        return true
      } else {
        const errorData = await response.json()
        alert(`登录失败: ${errorData.error}`)
        return false
      }
    } catch (error) {
      console.error('登录错误:', error)
      alert('登录失败，请检查网络连接')
      return false
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('退出登录错误:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('admin_token')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}