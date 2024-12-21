'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchRssFeed, addFeed, getFeeds, addToHistory, getHistory, deleteFeed, editFeed } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from './icons'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { addBookmark, getBookmarks, removeBookmark } from '@/app/actions'

interface RssFeedReaderProps {
  user: { id: string; username: string };
  onLogout: () => void
}

interface Feed {
  id: string;
  url: string;
  isDefault: boolean;
}

interface HistoryItem {
  _id: string;
  title: string;
  link: string;
  contentSnippet: string;
  openedAt: string;
  service: string;
}

interface BookmarkItem {
  _id: string;
  title: string;
  link: string;
  contentSnippet: string;
  feedUrl: string;
  createdAt: string;
}

export default function RssFeedReader({ user, onLogout }: RssFeedReaderProps) {
  const [url, setUrl] = useState('')
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [selectedFeed, setSelectedFeed] = useState('')
  const [feed, setFeed] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null)
  const [editingUrl, setEditingUrl] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())

  const observer = useRef<IntersectionObserver | null>(null)
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    loadFeeds();
    loadHistory();
    loadBookmarks();
  }, [user.id]);

  useEffect(() => {
    if (selectedFeed) {
      setPage(1)
      fetchFeed(true)
    }
  }, [selectedFeed])

  useEffect(() => {
    if (page > 1 && selectedFeed) {
      fetchFeed()
    }
  }, [page])

  const loadFeeds = async () => {
    const result = await getFeeds(user.id)
    if (result.success) {
      setFeeds(result.feeds || [])
    }
  }

  const loadHistory = async () => {
    const result = await getHistory(user.id)
    if (result.success) {
      const formattedHistory = result.history && result.history.map((item: any) => ({
        _id: item._id,
        title: item.title || '',
        link: item.link || '',
        contentSnippet: item.contentSnippet || '',
        openedAt: item.openedAt,
        service: item.service || 'bare'
      }))
      setHistory(formattedHistory || [])
    }
  }

  const loadBookmarks = async () => {
    const result = await getBookmarks(user.id)
    if (result.success) {
      const formattedBookmarks = result.bookmarks && result.bookmarks.map((item: any) => ({
        _id: item._id,
        title: item.title || '',
        link: item.link || '',
        contentSnippet: item.contentSnippet || '',
        feedUrl: item.feedUrl || '',
        createdAt: item.createdAt || ''
      }))
      // setBookmarks(formattedBookmarks || [])
      // setBookmarkedItems(new Set(formattedBookmarks.map(item => item.link)))
      setBookmarks(formattedBookmarks || [])
      setBookmarkedItems(new Set(formattedBookmarks ? formattedBookmarks.map(item => item.link) : []))

    }
  }

  const fetchFeed = async (reset: boolean = false) => {
    if (!selectedFeed) return
    setLoading(true)
    setError(null)
    const currentPage = reset ? 1 : page
    const result: any = await fetchRssFeed(selectedFeed, currentPage)
    setLoading(false)
    if (result.success) {
      setFeed((prevFeed: any) => {
        if (reset || !prevFeed) return result.feed
        return {
          ...result.feed,
          items: [...prevFeed.items, ...result.feed.items]
        }
      })
      setHasMore(result.hasMore)
    } else {
      setError(result.error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result: any = await addFeed(url, user.id)
    if (result.success) {
      loadFeeds()
      setUrl('')
    } else {
      setError(result.error)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingFeed) {
      const result = await editFeed(editingFeed.id, editingUrl, user.id)
      if (result.success) {
        loadFeeds()
        setIsEditDialogOpen(false)
        setEditingFeed(null)
        setEditingUrl('')
      } else {
        setError(result.error || "An error occurred")
      }
    }
  }

  const handleDelete = async (feedId: string) => {
    const result = await deleteFeed(feedId, user.id)
    if (result.success) {
      loadFeeds()
      if (selectedFeed === feedId) {
        setSelectedFeed('')
        setFeed(null)
      }
    } else {
      setError(result.error || "An error occurred")
    }
  }

  const openEditDialog = (feed: Feed) => {
    setEditingFeed(feed)
    setEditingUrl(feed.url)
    setIsEditDialogOpen(true)
  }

  const openLink = async (item: any, service: 'archive' | 'smry' | 'bare') => {
    const link =
      service === 'bare'
        ? item.link
        : service === 'archive'
          ? `https://archive.is/${item.link}`
          : `https://smry.ai/${item.link}`;

    window.open(link, '_blank');

    const isDuplicate = history.some(historyItem =>
      historyItem.link === item.link &&
      new Date(historyItem.openedAt).toDateString() === new Date().toDateString()
    );

    if (!isDuplicate) {
      await addToHistory({
        title: item.title,
        link: item.link,
        contentSnippet: item.contentSnippet,
        service
      }, user.id);
      loadHistory();
    }
  };

  const handleBookmark = async (item: any) => {
    if (bookmarkedItems.has(item.link)) {
      const bookmarkToRemove = bookmarks.find(bookmark => bookmark.link === item.link);
      if (bookmarkToRemove) {
        const result = await removeBookmark(bookmarkToRemove._id, user.id);
        if (result.success) {
          setBookmarkedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.link);
            return newSet;
          });
        } else {
          setError(result.error || "Failed to remove bookmark");
        }
      }
    } else {
      const result = await addBookmark(item, user.id);
      if (result.success) {
        setBookmarkedItems(prev => new Set(prev).add(item.link));
      } else {
        setError(result.error || "Failed to add bookmark");
      }
    }
    loadBookmarks();
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    const result = await removeBookmark(bookmarkId, user.id);
    if (result.success) {
      loadBookmarks();
    } else {
      setError(result.error || "Failed to remove bookmark");
    }
  };

  return (
    <div className="space-y-4 animate-in">
      <div className="flex justify-between items-center">
        {/*<div className="flex items-center space-x-2">
          <Icons.rss className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">RSS Freeder</h1>
        </div>*/}
        {/* <div className="flex items-center space-x-2"> */}
        <p className="text-sm text-muted-foreground">
          Welcome, {user.username}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
        >
          <Icons.logout className="h-4 w-4 mr-2" />
          Logout
        </Button>
        {/* </div> */}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feed URL</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="url"
              value={editingUrl}
              onChange={(e) => setEditingUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="feeds" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-12">
          <TabsTrigger value="feeds" className="flex items-center gap-2">
            <Icons.rss className="h-4 w-4" />
            Feeds
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Icons.bookmark className="h-4 w-4" />
            Bookmarks
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Icons.history className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-4 mt-4">
          <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-lg">Add New Feed</CardTitle>
              <CardDescription>Enter an RSS feed URL to add it to your collection</CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  required
                  className="flex-grow"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  <Icons.plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Add</span>
                </Button>
              </form>
            </CardContent>
          </Card>
          {feeds.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {feeds.map((feed) => (
                <div key={feed.id}>
                  <Button
                    onClick={() => setSelectedFeed(feed.url)}
                    variant={selectedFeed === feed.url ? "default" : "outline"}
                    size="sm"
                    className="w-full text-sm truncate justify-between group"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center truncate">
                            <Icons.rss className="mr-2 h-3 w-3 shrink-0" />
                            <span className="truncate">{new URL(feed.url).hostname}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{feed.url}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-center gap-1 ml-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(feed);
                              }}
                            >
                              <Icons.edit className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit feed</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(feed.id);
                              }}
                            >
                              <Icons.trash className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete feed</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {feed && (
            <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
              <div className="space-y-4">
                {feed.items.map((item: any, index: number) => (
                  <Card
                    key={index}
                    ref={index === feed.items.length - 1 ? lastItemRef : null}
                    className="border-0 shadow-none sm:border sm:shadow-sm"
                  >
                    <CardHeader className="px-0 sm:px-6">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">
                        <button
                          onClick={() => openLink(item, 'bare')}
                          className="text-left hover:underline w-full"
                        >
                          {item.title}
                        </button>
                      </CardTitle>
                      {item.pubDate && (
                        <CardDescription className="text-xs">
                          {new Date(item.pubDate).toLocaleDateString()}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6 space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.contentSnippet}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => openLink(item, 'smry')}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Icons.read className="mr-2 h-4 w-4" />
                          Read in Smry.ai
                        </Button>
                        <Button
                          onClick={() => handleBookmark(item)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {bookmarkedItems.has(item.link) ? (
                            <Icons.bookmark fill='true' className="mr-2 h-4 w-4" />
                          ) : (
                            <Icons.bookmark className="mr-2 h-4 w-4" />
                          )}
                          {bookmarkedItems.has(item.link) ? 'Bookmarked' : 'Bookmark'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {loading && (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse border-0 shadow-none sm:border sm:shadow-sm">
                        <CardHeader className="px-0 sm:px-6">
                          <div className="h-5 w-2/3 bg-muted rounded" />
                          <div className="h-3 w-1/3 bg-muted rounded" />
                        </CardHeader>
                        <CardContent className="px-0 sm:px-6">
                          <div className="space-y-2">
                            <div className="h-4 w-full bg-muted rounded" />
                            <div className="h-4 w-full bg-muted rounded" />
                            <div className="h-4 w-2/3 bg-muted rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              {!hasMore && !loading && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No more items to load
                </p>
              )}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
            <div className="space-y-4">
              {bookmarks.map((item) => (
                <Card key={item._id} className="border-0 shadow-none sm:border sm:shadow-sm">
                  <CardHeader className="px-0 sm:px-6">
                    <CardTitle className="text-base sm:text-lg line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Bookmarked on {new Date(item.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 sm:px-6 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.contentSnippet}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => window.open(item.link, '_blank')}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Icons.read className="mr-2 h-4 w-4" />
                        Read Original
                      </Button>
                      <Button
                        onClick={() => handleRemoveBookmark(item._id)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Icons.bookmark fill='fff' className="mr-2 h-4 w-4" />
                        Remove Bookmark
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {bookmarks.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  No bookmarks yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item._id} className="border-0 shadow-none sm:border sm:shadow-sm">
                  <CardHeader className="px-0 sm:px-6">
                    <CardTitle className="text-base sm:text-lg line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Read on {new Date(item.openedAt).toLocaleString()} via {item.service}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 sm:px-6 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.contentSnippet}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => window.open(item.link, '_blank')}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Icons.read className="mr-2 h-4 w-4" />
                        Read Original
                      </Button>
                      <Button
                        onClick={() => window.open(`https://smry.ai/${item.link}`, '_blank')}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Icons.read className="mr-2 h-4 w-4" />
                        Read in Smry.ai
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {history.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  No reading history yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}


// 'use client'

// import { useState, useEffect, useRef, useCallback } from 'react'
// import { fetchRssFeed, addFeed, getFeeds, addToHistory, getHistory, deleteFeed, editFeed } from '../actions'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Icons } from './icons'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
// import { Badge } from '@/components/ui/badge'
// import { DOMParser } from 'xmldom'
// import { addBookmark, getBookmarks, removeBookmark } from '@/app/actions'

// interface RssFeedReaderProps {
//   user: { id: string; username: string };
//   onLogout: () => void
// }

// interface Feed {
//   id: string;
//   url: string;
//   isDefault: boolean;
// }

// interface HistoryItem {
//   _id: string;
//   title: string;
//   link: string;
//   contentSnippet: string;
//   openedAt: string;
//   service: string;
// }

// interface BookmarkItem {
//   _id: string;
//   title: string;
//   link: string;
//   contentSnippet: string;
//   feedUrl: string;
//   createdAt: string;
// }

// export default function RssFeedReader({ user, onLogout }: RssFeedReaderProps) {
//   const [url, setUrl] = useState('')
//   const [feeds, setFeeds] = useState<Feed[]>([])
//   const [selectedFeed, setSelectedFeed] = useState('')
//   const [feed, setFeed] = useState<any>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [page, setPage] = useState(1)
//   const [loading, setLoading] = useState(false)
//   const [hasMore, setHasMore] = useState(true)
//   const [history, setHistory] = useState<HistoryItem[]>([])
//   const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
//   const [editingFeed, setEditingFeed] = useState<Feed | null>(null)
//   const [editingUrl, setEditingUrl] = useState('')
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())

//   const observer = useRef<IntersectionObserver | null>(null)
//   const lastItemRef = useCallback((node: HTMLDivElement) => {
//     if (loading) return
//     if (observer.current) observer.current.disconnect()
//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting && hasMore) {
//         setPage(prevPage => prevPage + 1)
//       }
//     })
//     if (node) observer.current.observe(node)
//   }, [loading, hasMore])

//   useEffect(() => {
//     loadFeeds();
//     loadHistory();
//     loadBookmarks();
//   }, [user.id]);

//   useEffect(() => {
//     if (selectedFeed) {
//       setPage(1)
//       fetchFeed(true)
//     }
//   }, [selectedFeed])

//   useEffect(() => {
//     if (page > 1 && selectedFeed) {
//       fetchFeed()
//     }
//   }, [page])

//   const loadFeeds = async () => {
//     const result = await getFeeds(user.id)
//     if (result.success) {
//       setFeeds(result.feeds || [])
//     }
//   }

//   const loadHistory = async () => {
//     const result = await getHistory(user.id)
//     if (result.success) {
//       const formattedHistory = result.history && result.history.map((item: any) => ({
//         _id: item._id,
//         title: item.title || '',
//         link: item.link || '',
//         contentSnippet: item.contentSnippet || '',
//         openedAt: item.openedAt,
//         service: item.service || 'bare'
//       }))
//       setHistory(formattedHistory || [])
//     }
//   }

//   const loadBookmarks = async () => {
//     const result = await getBookmarks(user.id)
//     if (result.success) {
//       const formattedBookmarks = result.bookmarks && result.bookmarks.map((item: any) => ({
//         _id: item._id,
//         title: item.title || '',
//         link: item.link || '',
//         contentSnippet: item.contentSnippet || '',
//         feedUrl: item.feedUrl || '',
//         createdAt: item.createdAt || ''
//       }))
//       if (formattedBookmarks) {
//         setBookmarks(formattedBookmarks)
//         setBookmarkedItems(new Set(formattedBookmarks.map((item: any) => item.link)))
//       }
//     }
//   }

//   const fetchFeed = async (reset: boolean = false) => {
//     if (!selectedFeed) return
//     setLoading(true)
//     setError(null)
//     const currentPage = reset ? 1 : page
//     const result: any = await fetchRssFeed(selectedFeed, currentPage)
//     setLoading(false)
//     if (result.success) {
//       setFeed((prevFeed: any) => {
//         if (reset || !prevFeed) return result.feed
//         return {
//           ...result.feed,
//           items: [...prevFeed.items, ...result.feed.items]
//         }
//       })
//       setHasMore(result.hasMore)
//     } else {
//       setError(result.error)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)
//     setLoading(true)

//     try {
//       const response = await fetch(url)
//       const text = await response.text()
//       const parser = new DOMParser()
//       const xmlDoc = parser.parseFromString(text, "text/xml")

//       if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
//         throw new Error("Invalid RSS feed")
//       }

//       const result: any = await addFeed(url, user.id)
//       if (result.success) {
//         loadFeeds()
//         setUrl('')
//       } else {
//         setError(result.error)
//       }
//     } catch (error) {
//       setError("Invalid RSS feed URL")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (editingFeed) {
//       const result = await editFeed(editingFeed.id, editingUrl, user.id)
//       if (result.success) {
//         loadFeeds()
//         setIsEditDialogOpen(false)
//         setEditingFeed(null)
//         setEditingUrl('')
//       } else {
//         setError(result.error || "An error occurred")
//       }
//     }
//   }

//   const handleDelete = async (feedId: string) => {
//     const result = await deleteFeed(feedId, user.id)
//     if (result.success) {
//       loadFeeds()
//       if (selectedFeed === feedId) {
//         setSelectedFeed('')
//         setFeed(null)
//       }
//     } else {
//       setError(result.error || "An error occurred")
//     }
//   }

//   const openEditDialog = (feed: Feed) => {
//     setEditingFeed(feed)
//     setEditingUrl(feed.url)
//     setIsEditDialogOpen(true)
//   }

//   const openLink = async (item: any, service: 'archive' | 'smry' | 'bare') => {
//     const link =
//       service === 'bare'
//         ? item.link
//         : service === 'archive'
//           ? `https://archive.is/${item.link}`
//           : `https://smry.ai/${item.link}`;

//     window.open(link, '_blank');

//     const isDuplicate = history.some(historyItem =>
//       historyItem.link === item.link &&
//       new Date(historyItem.openedAt).toDateString() === new Date().toDateString()
//     );

//     if (!isDuplicate) {
//       await addToHistory({
//         title: item.title,
//         link: item.link,
//         contentSnippet: item.contentSnippet,
//         service
//       }, user.id);
//       loadHistory();
//     }
//   };

//   const handleBookmark = async (item: any) => {
//     if (bookmarkedItems.has(item.link)) {
//       const bookmarkToRemove = bookmarks.find(bookmark => bookmark.link === item.link);
//       if (bookmarkToRemove) {
//         const result = await removeBookmark(bookmarkToRemove._id, user.id);
//         if (result.success) {
//           setBookmarkedItems(prev => {
//             const newSet = new Set(prev);
//             newSet.delete(item.link);
//             return newSet;
//           });
//         } else {
//           setError(result.error || "Failed to remove bookmark");
//         }
//       }
//     } else {
//       const result = await addBookmark(item, user.id);
//       if (result.success) {
//         setBookmarkedItems(prev => new Set(prev).add(item.link));
//       } else {
//         setError(result.error || "Failed to add bookmark");
//       }
//     }
//     loadBookmarks();
//   };

//   const handleRemoveBookmark = async (bookmarkId: string) => {
//     const result = await removeBookmark(bookmarkId, user.id);
//     if (result.success) {
//       loadBookmarks();
//     } else {
//       setError(result.error || "Failed to remove bookmark");
//     }
//   };

//   return (
//     <div className="space-y-4 animate-in">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center space-x-2">
//           <Icons.rss className="h-6 w-6 text-primary" />
//           <h1 className="text-2xl font-bold">RSS Freeder</h1>
//         </div>
//         <div className="flex items-center space-x-2">
//           <p className="text-sm text-muted-foreground">
//             Welcome, {user.username}
//           </p>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onLogout}
//           >
//             <Icons.logout className="h-4 w-4 mr-2" />
//             Logout
//           </Button>
//         </div>
//       </div>

//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Feed URL</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleEditSubmit} className="space-y-4">
//             <Input
//               type="url"
//               value={editingUrl}
//               onChange={(e) => setEditingUrl(e.target.value)}
//               placeholder="https://example.com/feed.xml"
//               required
//             />
//             <div className="flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Save</Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <Tabs defaultValue="feeds" className="w-full">
//         <TabsList className="w-full grid grid-cols-3 h-12">
//           <TabsTrigger value="feeds" className="flex items-center gap-2">
//             <Icons.rss className="h-4 w-4" />
//             Feeds
//           </TabsTrigger>
//           <TabsTrigger value="bookmarks" className="flex items-center gap-2">
//             <Icons.bookmark className="h-4 w-4" />
//             Bookmarks
//           </TabsTrigger>
//           <TabsTrigger value="history" className="flex items-center gap-2">
//             <Icons.history className="h-4 w-4" />
//             History
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="feeds" className="space-y-4 mt-4">
//           <Card className="border-0 shadow-none sm:border sm:shadow-sm">
//             <CardHeader className="px-0 sm:px-6">
//               <CardTitle className="text-lg">Add New Feed</CardTitle>
//               <CardDescription>Enter an RSS feed URL to add it to your collection</CardDescription>
//             </CardHeader>
//             <CardContent className="px-0 sm:px-6">
//               <form onSubmit={handleSubmit} className="flex gap-2">
//                 <Input
//                   type="url"
//                   value={url}
//                   onChange={(e) => setUrl(e.target.value)}
//                   placeholder="https://example.com/feed.xml"
//                   required
//                   className="flex-grow"
//                 />
//                 <Button type="submit" size="sm" className="shrink-0">
//                   <Icons.plus className="h-4 w-4" />
//                   <span className="hidden sm:inline ml-2">Add</span>
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//           {feeds.length > 0 && (
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//               {feeds.map((feed) => (
//                 <div key={feed.id}>
//                   <Button
//                     onClick={() => setSelectedFeed(feed.url)}
//                     variant={selectedFeed === feed.url ? "default" : "outline"}
//                     size="sm"
//                     className="w-full text-sm truncate justify-between group"
//                   >
//                     <TooltipProvider>
//                       <Tooltip>
//                         <TooltipTrigger asChild>
//                           <div className="flex items-center truncate">
//                             <Icons.rss className="mr-2 h-3 w-3 shrink-0" />
//                             <span className="truncate">{new URL(feed.url).hostname}</span>
//                           </div>
//                         </TooltipTrigger>
//                         <TooltipContent>{feed.url}</TooltipContent>
//                       </Tooltip>
//                     </TooltipProvider>
//                     <div className="flex items-center gap-1 ml-2">
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 p-0"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 openEditDialog(feed);
//                               }}
//                             >
//                               <Icons.edit className="h-3 w-3" />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>Edit feed</TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 p-0"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDelete(feed.id);
//                               }}
//                             >
//                               <Icons.trash className="h-3 w-3" />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>Delete feed</TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {error && (
//             <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
//               {error}
//             </div>
//           )}

//           {feed && (
//             <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
//               <div className="space-y-4">
//                 {feed.items.map((item: any, index: number) => (
//                   <Card
//                     key={index}
//                     ref={index === feed.items.length - 1 ? lastItemRef : null}
//                     className="border-0 shadow-none sm:border sm:shadow-sm"
//                   >
//                     <CardHeader className="px-0 sm:px-6">
//                       <CardTitle className="text-base sm:text-lg line-clamp-2">
//                         <button
//                           onClick={() => openLink(item, 'bare')}
//                           className="text-left hover:underline w-full"
//                         >
//                           {item.title}
//                         </button>
//                       </CardTitle>
//                       {item.pubDate && (
//                         <CardDescription className="text-xs">
//                           {new Date(item.pubDate).toLocaleDateString()}
//                         </CardDescription>
//                       )}
//                     </CardHeader>
//                     <CardContent className="px-0 sm:px-6 space-y-4">
//                       <p className="text-sm text-muted-foreground line-clamp-1">
//                         {item.contentSnippet}
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         <Button
//                           onClick={() => openLink(item, 'smry')}
//                           variant="outline"
//                           size="sm"
//                           className="w-full sm:w-auto"
//                         >
//                           <Icons.read className="mr-2 h-4 w-4" />
//                           Read in Smry.ai
//                         </Button>
//                         <Button
//                           onClick={() => handleBookmark(item)}
//                           variant="outline"
//                           size="sm"
//                           className="w-full sm:w-auto"
//                         >
//                           {bookmarkedItems.has(item.link) ? (
//                             <Icons.bookmarkFilled className="mr-2 h-4 w-4" />
//                           ) : (
//                             <Icons.bookmark className="mr-2 h-4 w-4" />
//                           )}
//                           {bookmarkedItems.has(item.link) ? 'Bookmarked' : 'Bookmark'}
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//                 {loading && (
//                   <div className="space-y-4">
//                     {[...Array(3)].map((_, i) => (
//                       <Card key={i} className="animate-pulse border-0 shadow-none sm:border sm:shadow-sm">
//                         <CardHeader className="px-0 sm:px-6">
//                           <div className="h-5 w-2/3 bg-muted rounded" />
//                           <div className="h-3 w-1/3 bg-muted rounded" />
//                         </CardHeader>
//                         <CardContent className="px-0 sm:px-6">
//                           <div className="space-y-2">
//                             <div className="h-4 w-full bg-muted rounded" />
//                             <div className="h-4 w-full bg-muted rounded" />
//                             <div className="h-4 w-2/3 bg-muted rounded" />
//                           </div>
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {!hasMore && !loading && (
//                 <p className="text-center text-sm text-muted-foreground mt-4">
//                   No more items to load
//                 </p>
//               )}
//             </ScrollArea>
//           )}
//         </TabsContent>

//         <TabsContent value="bookmarks" className="mt-4">
//           <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
//             <div className="space-y-4">
//               {bookmarks.map((item) => (
//                 <Card key={item._id} className="border-0 shadow-none sm:border sm:shadow-sm">
//                   <CardHeader className="px-0 sm:px-6">
//                     <CardTitle className="text-base sm:text-lg line-clamp-2">{item.title}</CardTitle>
//                     <CardDescription className="text-xs">
//                       Bookmarked on {new Date(item.createdAt).toLocaleString()}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="px-0 sm:px-6 space-y-4">
//                     <p className="text-sm text-muted-foreground line-clamp-3">
//                       {item.contentSnippet}
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       <Button
//                         onClick={() => window.open(item.link, '_blank')}
//                         variant="outline"
//                         size="sm"
//                         className="w-full sm:w-auto"
//                       >
//                         <Icons.read className="mr-2 h-4 w-4" />
//                         Read Original
//                       </Button>
//                       <Button
//                         onClick={() => handleRemoveBookmark(item._id)}
//                         variant="outline"
//                         size="sm"
//                         className="w-full sm:w-auto"
//                       >
//                         <Icons.trash className="mr-2 h-4 w-4" />
//                         Remove Bookmark
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//               {bookmarks.length === 0 && (
//                 <div className="text-center text-sm text-muted-foreground">
//                   No bookmarks yet
//                 </div>
//               )}
//             </div>
//           </ScrollArea>
//         </TabsContent>

//         <TabsContent value="history" className="mt-4">
//           <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
//             <div className="space-y-4">
//               {history.map((item) => (
//                 <Card key={item._id} className="border-0 shadow-none sm:border sm:shadow-sm">
//                   <CardHeader className="px-0 sm:px-6">
//                     <CardTitle className="text-base sm:text-lg line-clamp-2">{item.title}</CardTitle>
//                     <CardDescription className="text-xs">
//                       Read on {new Date(item.openedAt).toLocaleString()} via {item.service}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="px-0 sm:px-6 space-y-4">
//                     <p className="text-sm text-muted-foreground line-clamp-3">
//                       {item.contentSnippet}
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       <Button
//                         onClick={() => window.open(item.link, '_blank')}
//                         variant="outline"
//                         size="sm"
//                         className="w-full sm:w-auto"
//                       >
//                         <Icons.read className="mr-2 h-4 w-4" />
//                         Read Original
//                       </Button>
//                       <Button
//                         onClick={() => window.open(`https://smry.ai/${item.link}`, '_blank')}
//                         variant="outline"
//                         size="sm"
//                         className="w-full sm:w-auto"
//                       >
//                         <Icons.read className="mr-2 h-4 w-4" />
//                         Read in Smry.ai
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//               {history.length === 0 && (
//                 <div className="text-center text-sm text-muted-foreground">
//                   No reading history yet
//                 </div>
//               )}
//             </div>
//           </ScrollArea>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

