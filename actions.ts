// 'use server'

// import Parser from 'rss-parser'

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// const parser = new Parser()

// export async function fetchRssFeed(url: string, page: number = 1, itemsPerPage: number = 10) {
//   try {
//     const feed = await parser.parseURL(url)
//     const startIndex = (page - 1) * itemsPerPage
//     const endIndex = startIndex + itemsPerPage
//     const paginatedItems = feed.items.slice(startIndex, endIndex)
//     return {
//       success: true,
//       feed: {
//         ...feed,
//         items: paginatedItems
//       },
//       hasMore: endIndex < feed.items.length
//     }
//   } catch (error) {
//     console.error('Error fetching RSS feed:', error)
//     return { success: false, error: 'Failed to fetch RSS feed' }
//   }
// }

// export async function registerUser(username: string, password: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/users`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password })
//     })
//     if (!response.ok) throw new Error('Failed to register user')
//     return { success: true }
//   } catch (error) {
//     console.error('Error registering user:', error)
//     return { success: false, error: 'Failed to register user' }
//   }
// }

// export async function loginUser(username: string, password: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
//     if (!response.ok) throw new Error('Failed to login')
//     const user = await response.json()
//     return { success: true, user }
//   } catch (error) {
//     console.error('Error logging in:', error)
//     return { success: false, error: 'Failed to login' }
//   }
// }

// export async function addFeed(url: string, userId: number) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/feeds`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url, userId })
//     })
//     if (!response.ok) throw new Error('Failed to add feed')
//     return { success: true }
//   } catch (error) {
//     console.error('Error adding feed:', error)
//     return { success: false, error: 'Failed to add feed' }
//   }
// }

// export async function getFeeds(userId: number) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/feeds?userId=${userId}`)
//     if (!response.ok) throw new Error('Failed to fetch feeds')
//     const feeds = await response.json()
//     return { success: true, feeds }
//   } catch (error) {
//     console.error('Error fetching feeds:', error)
//     return { success: false, error: 'Failed to fetch feeds' }
//   }
// }

// export async function addToHistory(item: any, userId: number) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/history`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ ...item, userId })
//     })
//     if (!response.ok) throw new Error('Failed to add to history')
//     return { success: true }
//   } catch (error) {
//     console.error('Error adding to history:', error)
//     return { success: false, error: 'Failed to add to history' }
//   }
// }

// export async function getHistory(userId: number) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/history?userId=${userId}`)
//     if (!response.ok) throw new Error('Failed to fetch history')
//     const history = await response.json()
//     return { success: true, history }
//   } catch (error) {
//     console.error('Error fetching history:', error)
//     return { success: false, error: 'Failed to fetch history' }
//   }
// }

// "use server";

// import Parser from "rss-parser";

// const parser = new Parser();
// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// export async function fetchRssFeed(
//   url: string,
//   page: number = 1,
//   itemsPerPage: number = 10
// ) {
//   try {
//     const feed = await parser.parseURL(url);
//     const startIndex = (page - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const paginatedItems = feed.items.slice(startIndex, endIndex);
//     return {
//       success: true,
//       feed: {
//         ...feed,
//         items: paginatedItems,
//       },
//       hasMore: endIndex < feed.items.length,
//     };
//   } catch (error) {
//     console.error("Error fetching RSS feed:", error);
//     return { success: false, error: "Failed to fetch RSS feed" };
//   }
// }

// export async function registerUser(username: string, password: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/users`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });
//     if (!response.ok) throw new Error("Failed to register user");
//     return { success: true };
//   } catch (error) {
//     console.error("Error registering user:", error);
//     return { success: false, error: "Failed to register user" };
//   }
// }

// export async function loginUser(username: string, password: string) {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/api/users?username=${username}&password=${password}`
//     );
//     if (!response.ok) throw new Error("Failed to login");
//     const user = await response.json();
//     return { success: true, user };
//   } catch (error) {
//     console.error("Error logging in:", error);
//     return { success: false, error: "Failed to login" };
//   }
// }

// export async function addFeed(url: string, userId: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/feeds`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ url, userId }),
//     });
//     if (!response.ok) throw new Error("Failed to add feed");
//     return { success: true };
//   } catch (error) {
//     console.error("Error adding feed:", error);
//     return { success: false, error: "Failed to add feed" };
//   }
// }

// export async function getFeeds(userId: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/feeds?userId=${userId}`);
//     if (!response.ok) throw new Error("Failed to fetch feeds");
//     const feeds = await response.json();
//     return { success: true, feeds };
//   } catch (error) {
//     console.error("Error fetching feeds:", error);
//     return { success: false, error: "Failed to fetch feeds" };
//   }
// }

// export async function addToHistory(item: any, userId: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/history`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ...item, userId }),
//     });
//     if (!response.ok) throw new Error("Failed to add to history");
//     return { success: true };
//   } catch (error) {
//     console.error("Error adding to history:", error);
//     return { success: false, error: "Failed to add to history" };
//   }
// }

// export async function getHistory(userId: string) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/history?userId=${userId}`);
//     if (!response.ok) throw new Error("Failed to fetch history");
//     const history = await response.json();
//     return { success: true, history };
//   } catch (error) {
//     console.error("Error fetching history:", error);
//     return { success: false, error: "Failed to fetch history" };
//   }
// }

"use server";

import Parser from "rss-parser";

const parser = new Parser();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export async function fetchRssFeed(
  url: string,
  page: number = 1,
  itemsPerPage: number = 10
) {
  try {
    const feed = await parser.parseURL(url);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = feed.items.slice(startIndex, endIndex);
    return {
      success: true,
      feed: {
        ...feed,
        items: paginatedItems,
      },
      hasMore: endIndex < feed.items.length,
    };
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return { success: false, error: "Failed to fetch RSS feed" };
  }
}

export async function registerUser(username: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("Failed to register user");
    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function loginUser(username: string, password: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/users?username=${username}&password=${password}`
    );
    if (!response.ok) throw new Error("Failed to login");
    const user = await response.json();
    if (user.error) throw new Error(user.error);
    return { success: true, user: { id: user.id, username: user.username } };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: "Failed to login" };
  }
}

export async function addFeed(url: string, userId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/feeds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, userId }),
    });
    if (!response.ok) throw new Error("Failed to add feed");
    return { success: true };
  } catch (error) {
    console.error("Error adding feed:", error);
    return { success: false, error: "Failed to add feed" };
  }
}

export async function getFeeds(userId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/feeds?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch feeds");
    const feeds = await response.json();
    return { success: true, feeds };
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return { success: false, error: "Failed to fetch feeds" };
  }
}

export async function addToHistory(item: any, userId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, userId }),
    });
    if (!response.ok) throw new Error("Failed to add to history");
    return { success: true };
  } catch (error) {
    console.error("Error adding to history:", error);
    return { success: false, error: "Failed to add to history" };
  }
}

export async function getHistory(userId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/history?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch history");
    const history = await response.json();
    // Sort history array by openedAt in descending order (newest first)
    const sortedHistory = history.sort(
      (a: any, b: any) =>
        new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
    );
    return { success: true, history: sortedHistory };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}
