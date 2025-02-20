'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/icons'
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
    return null // Return nothing while checking localStorage
  }
  return (
    <>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 pb-8">
          <div className="flex items-center justify-center mb-1">
            <img src="/icon.svg" alt="RSS Freeder Logo" className="h-36 w-36" />
            {/* <h1 className="text-3xl font-bold tracking-tight">RSS Freeder</h1> */}
          </div>
          {user ? (
            <RssFeedReader user={user} onLogout={handleLogout} />
          ) : (
            <Auth onLogin={handleLogin} />
          )}
        </div>
      </main>
    </>
  )
}
