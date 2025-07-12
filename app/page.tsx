'use client'

import { useState, useEffect } from 'react'
import RssFeedReader from '@/components/RssFeedReader'
import Auth from '@/components/Auth'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for saved user data in localStorage on component mount
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (loggedInUser: any) => {
    // Save user data to localStorage on login
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    // Remove user data from localStorage on logout
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header with logo and title */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="RSS Freeder Logo" className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight text-center">RSS Freeder</h1>
            </div>
          </div>
          
          {/* Main content */}
          <div className="max-w-6xl mx-auto">
            {user ? (
              <RssFeedReader user={user} onLogout={handleLogout} />
            ) : (
              <div className="flex justify-center">
                <Auth onLogin={handleLogin} />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
