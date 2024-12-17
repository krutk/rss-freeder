'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchRssFeed, addFeed, getFeeds, addToHistory, getHistory } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from './icons'
import { ScrollArea } from '@/components/ui/scroll-area'

const DEFAULT_FEEDS = [
  'https://developers.googleblog.com/feeds/posts/default',
  'https://stackoverflow.blog/feed/',
  'https://dev.to/feed',
  'https://thisweekinreact.com/newsletter/rss.xml',
  'https://scotch.io/feed',
  'https://alistapart.com/main/feed',
  'https://css-tricks.com/feed'
]

interface RssFeedReaderProps {
  user: { id: string; username: string };
  onLogout: () => void
}

export default function RssFeedReader({ user, onLogout }: RssFeedReaderProps) {
  const [url, setUrl] = useState('')
  const [feeds, setFeeds] = useState<string[]>([])
  const [selectedFeed, setSelectedFeed] = useState('')
  const [feed, setFeed] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [history, setHistory] = useState<any[]>([])

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
      const userFeeds = result.feeds.map((feed: any) => feed.url)
      // Combine user feeds with default feeds, removing duplicates
      const allFeeds = [...new Set([...userFeeds, ...DEFAULT_FEEDS])]
      setFeeds(allFeeds)
    }
  }

  const loadHistory = async () => {
    const result = await getHistory(user.id)
    if (result.success) {
      setHistory(result.history)
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
      setFeeds(prevFeeds => [...prevFeeds, url])
      setUrl('')
    } else {
      setError(result.error)
    }
  }

  // const openLink = async (item: any, service: 'archive' | 'smry' | 'bare') => {
  //   const link = service === 'bare' ? item.link : service === 'archive' ? `https://archive.is/${item.link}` : `https://smry.ai/${item.link}`
  //   window.open(link, '_blank')

  //   // Check if this exact item+service combination already exists in history for today
  //   const isDuplicate = history.some(historyItem =>
  //     historyItem.link === item.link &&
  //     historyItem.service === service &&
  //     new Date(historyItem.openedAt).toDateString() === new Date().toDateString()
  //   )

  //   if (!isDuplicate) {
  //     await addToHistory({ ...item, openedAt: new Date().toISOString(), service }, user.id)
  //     loadHistory()
  //   }
  // }
  const openLink = async (item: any, service: 'archive' | 'smry' | 'bare') => {
    const link =
      service === 'bare'
        ? item.link
        : service === 'archive'
          ? `https://archive.is/${item.link}`
          : `https://smry.ai/${item.link}`;

    window.open(link, '_blank');

    // Check if this item already exists in history for today
    const isDuplicate = history.some(historyItem =>
      historyItem.link === item.link &&
      new Date(historyItem.openedAt).toDateString() === new Date().toDateString()
    );

    if (!isDuplicate) {
      // Add to history, regardless of the service used
      await addToHistory({ ...item, openedAt: new Date().toISOString(), service }, user.id);
      loadHistory();
    }
  };


  return (
    // <div className="space-y-6 animate-in">
    //   <div className="flex justify-between items-center">
    //     <div>
    //       <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.username}!</h2>
    //       <p className="text-muted-foreground">Manage your RSS feeds, reading history, and access paywall articles</p>
    //     </div>
    //     <Button variant="ghost" onClick={onLogout}>
    //       <Icons.logout className="mr-2 h-4 w-4" />
    //       Logout
    //     </Button>
    //   </div>

    //   <Tabs defaultValue="feeds" className="w-full">
    //     <TabsList className="w-full max-w-md">
    //       <TabsTrigger value="feeds" className="flex-1">
    //         <Icons.rss className="mr-2 h-4 w-4" />
    //         Feeds
    //       </TabsTrigger>
    //       <TabsTrigger value="history" className="flex-1">
    //         <Icons.history className="mr-2 h-4 w-4" />
    //         History
    //       </TabsTrigger>
    //     </TabsList>

    //     <TabsContent value="feeds" className="space-y-4">
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Add New Feed</CardTitle>
    //           <CardDescription>Enter the URL of an RSS feed to add it to your collection</CardDescription>
    //         </CardHeader>
    //         <CardContent>
    //           <form onSubmit={handleSubmit} className="flex gap-2">
    //             <Input
    //               type="url"
    //               value={url}
    //               onChange={(e) => setUrl(e.target.value)}
    //               placeholder="https://example.com/feed.xml"
    //               required
    //               className="flex-grow"
    //             />
    //             <Button type="submit">
    //               <Icons.plus className="mr-2 h-4 w-4" />
    //               Add Feed
    //             </Button>
    //           </form>
    //         </CardContent>
    //       </Card>

    //       {feeds.length > 0 && (
    //         <div className="flex gap-2 flex-wrap">
    //           {feeds.map((feed, index) => (
    //             <Button
    //               key={index}
    //               onClick={() => setSelectedFeed(feed)}
    //               variant={selectedFeed === feed ? "default" : "outline"}
    //               className="card-hover"
    //             >
    //               <Icons.rss className="mr-2 h-4 w-4" />
    //               {new URL(feed).hostname}
    //             </Button>
    //           ))}
    //         </div>
    //       )}

    //       {error && (
    //         <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
    //           {error}
    //         </div>
    //       )}

    //       {feed && (
    //         <ScrollArea className="h-[600px] rounded-md border p-4">
    //           <div className="space-y-4">
    //             {feed.items.map((item: any, index: number) => (
    //               <Card
    //                 key={index}
    //                 ref={index === feed.items.length - 1 ? lastItemRef : null}
    //                 className="card-hover"
    //               >
    //                 <CardHeader>
    //                   <CardTitle className="line-clamp-2">
    //                     <span onClick={() => openLink(item, 'bare')} className="cursor-pointer hover:underline">
    //                       {item.title}
    //                     </span>
    //                   </CardTitle>
    //                   {item.pubDate && (
    //                     <CardDescription>
    //                       Published on {new Date(item.pubDate).toLocaleDateString()}
    //                     </CardDescription>
    //                   )}
    //                 </CardHeader>
    //                 <CardContent>
    //                   <p className="mb-4 line-clamp-3 text-muted-foreground">
    //                     {item.contentSnippet}
    //                   </p>
    //                   <div className="flex gap-2">
    //                     {/* <Button onClick={() => openLink(item, 'archive')} variant="outline" size="sm">
    //                       <Icons.archive className="mr-2 h-4 w-4" />
    //                       Read in Archive.is
    //                     </Button> */}
    //                     <Button onClick={() => openLink(item, 'smry')} variant="outline" size="sm">
    //                       <Icons.read className="mr-2 h-4 w-4" />
    //                       Read in Smry.ai
    //                     </Button>
    //                   </div>
    //                 </CardContent>
    //               </Card>
    //             ))}
    //             {loading && (
    //               <div className="space-y-4">
    //                 {[...Array(3)].map((_, i) => (
    //                   <Card key={i} className="animate-pulse">
    //                     <CardHeader>
    //                       <div className="h-6 w-2/3 bg-muted rounded" />
    //                       <div className="h-4 w-1/3 bg-muted rounded" />
    //                     </CardHeader>
    //                     <CardContent>
    //                       <div className="space-y-2">
    //                         <div className="h-4 w-full bg-muted rounded" />
    //                         <div className="h-4 w-full bg-muted rounded" />
    //                         <div className="h-4 w-2/3 bg-muted rounded" />
    //                       </div>
    //                     </CardContent>
    //                   </Card>
    //                 ))}
    //               </div>
    //             )}
    //           </div>
    //           {!hasMore && !loading && (
    //             <p className="text-center text-muted-foreground mt-4">
    //               No more items to load
    //             </p>
    //           )}
    //         </ScrollArea>
    //       )}
    //     </TabsContent>

    //     <TabsContent value="history">
    //       <ScrollArea className="h-[600px] rounded-md border p-4">
    //         <div className="space-y-4">
    //           {history.map((item, index) => (
    //             <Card key={index} className="card-hover">
    //               <CardHeader>
    //                 <CardTitle className="line-clamp-2">{item.title}</CardTitle>
    //                 <CardDescription>
    //                   Read on {new Date(item.openedAt).toLocaleString()} using {item.service}
    //                 </CardDescription>
    //               </CardHeader>
    //               <CardContent>
    //                 <p className="line-clamp-3 text-muted-foreground">
    //                   {item.contentSnippet}
    //                 </p>
    //                 <div className="flex gap-2 mt-4">
    //                   <Button onClick={() => window.open(item.link, '_blank')} variant="outline" size="sm">
    //                     <Icons.read className="mr-2 h-4 w-4" />
    //                     Read Original
    //                   </Button>
    //                   <Button onClick={() => window.open(`https://smry.ai/${item.link}`, '_blank')} variant="outline" size="sm">
    //                     <Icons.read className="mr-2 h-4 w-4" />
    //                     Read in Smry.ai
    //                   </Button>
    //                 </div>
    //               </CardContent>
    //             </Card>
    //           ))}
    //           {history.length === 0 && (
    //             <div className="text-center text-muted-foreground">
    //               No reading history yet
    //             </div>
    //           )}
    //         </div>
    //       </ScrollArea>
    //     </TabsContent>
    //   </Tabs>
    // </div>
    <div className="space-y-4 animate-in">
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 pb-2">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="space-y-1">
            {/* <div className="flex items-center gap-2">
              <Icons.rss className="h-5 w-5 text-pink-500" />
              <h1 className="text-xl font-semibold">RSS Freeder</h1>
            </div> */}
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="sm:hidden"
          >
            <Icons.logout className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="hidden sm:flex items-center gap-2"
        >
          <Icons.logout className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="feeds" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-12">
          <TabsTrigger value="feeds" className="flex items-center gap-2">
            <Icons.rss className="h-4 w-4" />
            Feeds
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
              <CardDescription>Enter an RSS feed URL to add to your collection</CardDescription>
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
              {feeds.map((feed, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedFeed(feed)}
                  variant={selectedFeed === feed ? "default" : "outline"}
                  size="sm"
                  className="w-full text-sm truncate justify-start"
                >
                  <Icons.rss className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{new URL(feed).hostname}</span>
                </Button>
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
                      <p className="text-sm text-muted-foreground line-clamp-3">
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

        <TabsContent value="history" className="mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border-0 sm:border p-0 sm:p-4">
            <div className="space-y-4">
              {history.map((item, index) => (
                <Card key={index} className="border-0 shadow-none sm:border sm:shadow-sm">
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
