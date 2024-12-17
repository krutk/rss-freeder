'use server'

import Parser from 'rss-parser'

const parser = new Parser()

export async function fetchRssFeed(url: string, page: number = 1, itemsPerPage: number = 10) {
  try {
    const feed = await parser.parseURL(url)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = feed.items.slice(startIndex, endIndex)
    return { 
      success: true, 
      feed: {
        ...feed,
        items: paginatedItems
      },
      hasMore: endIndex < feed.items.length
    }
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return { success: false, error: 'Failed to fetch RSS feed' }
  }
}

export async function registerUser(username: string, password: string) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!response.ok) throw new Error('Failed to register user')
    return { success: true }
  } catch (error) {
    console.error('Error registering user:', error)
    return { success: false, error: 'Failed to register user' }
  }
}

export async function loginUser(username: string, password: string) {
  try {
    const response = await fetch(`/api/users?username=${username}&password=${password}`)
    if (!response.ok) throw new Error('Failed to login')
    const user = await response.json()
    return { success: true, user }
  } catch (error) {
    console.error('Error logging in:', error)
    return { success: false, error: 'Failed to login' }
  }
}

export async function addFeed(url: string, userId: number) {
  try {
    const response = await fetch('/api/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, userId })
    })
    if (!response.ok) throw new Error('Failed to add feed')
    return { success: true }
  } catch (error) {
    console.error('Error adding feed:', error)
    return { success: false, error: 'Failed to add feed' }
  }
}

export async function getFeeds(userId: number) {
  try {
    const response = await fetch(`/api/feeds?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch feeds')
    const feeds = await response.json()
    return { success: true, feeds }
  } catch (error) {
    console.error('Error fetching feeds:', error)
    return { success: false, error: 'Failed to fetch feeds' }
  }
}

export async function addToHistory(item: any, userId: number) {
  try {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, userId })
    })
    if (!response.ok) throw new Error('Failed to add to history')
    return { success: true }
  } catch (error) {
    console.error('Error adding to history:', error)
    return { success: false, error: 'Failed to add to history' }
  }
}

export async function getHistory(userId: number) {
  try {
    const response = await fetch(`/api/history?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch history')
    const history = await response.json()
    return { success: true, history }
  } catch (error) {
    console.error('Error fetching history:', error)
    return { success: false, error: 'Failed to fetch history' }
  }
}

