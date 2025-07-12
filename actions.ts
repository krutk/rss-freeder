"use server";

import Parser from "rss-parser";
import clientPromise from "./lib/mongodb";
import { ObjectId } from "mongodb";

const parser = new Parser();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const DEFAULT_FEEDS = [
  "https://developers.googleblog.com/feeds/posts/default",
  "https://stackoverflow.blog/feed/",
  "https://dev.to/feed",
  "https://thisweekinreact.com/newsletter/rss.xml",
  // "https://scotch.io/feed",
  "https://alistapart.com/main/feed",
  "https://css-tricks.com/feed",
];

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

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    
    // Check if username or email already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return { success: false, error: "Username or email already exists" };
    }
    
    const result = await db
      .collection("users")
      .insertOne({ username, email, password });

    // Add default feeds for the new user
    await Promise.all(
      DEFAULT_FEEDS.map((url) =>
        db.collection("feeds").insertOne({
          url,
          userId: result.insertedId.toString(),
          isDefault: true,
        })
      )
    );

    return { success: true, userId: result.insertedId.toString() };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    
    // Support login with either username or email
    const user = await db.collection("users").findOne({
      $or: [
        { email, password },
        { username: email, password } // Allow login with username in email field
      ]
    });
    
    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }
    
    return {
      success: true,
      user: { 
        id: user._id.toString(), 
        username: user.username,
        email: user.email 
      },
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: "Failed to login" };
  }
}

export async function addFeed(url: string, userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const result = await db
      .collection("feeds")
      .insertOne({ url, userId, isDefault: false });
    return { success: true, feedId: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding feed:", error);
    return { success: false, error: "Failed to add feed" };
  }
}

export async function getFeeds(userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const feeds = await db.collection("feeds").find({ userId }).toArray();
    return {
      success: true,
      feeds: feeds.map((feed) => ({
        id: feed._id.toString(),
        url: feed.url,
        isDefault: feed.isDefault || false,
      })),
    };
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return { success: false, error: "Failed to fetch feeds" };
  }
}

export async function editFeed(feedId: string, newUrl: string, userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const result = await db
      .collection("feeds")
      .updateOne(
        { _id: new ObjectId(feedId), userId },
        { $set: { url: newUrl, isDefault: false } }
      );
    if (result.matchedCount === 0) {
      return { success: false, error: "Feed not found or unauthorized" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error editing feed:", error);
    return { success: false, error: "Failed to edit feed" };
  }
}

export async function deleteFeed(feedId: string, userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const result = await db
      .collection("feeds")
      .deleteOne({ _id: new ObjectId(feedId), userId });
    if (result.deletedCount === 0) {
      return { success: false, error: "Feed not found or unauthorized" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting feed:", error);
    return { success: false, error: "Failed to delete feed" };
  }
}

export async function addToHistory(item: any, userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const serializedItem = {
      ...item,
      userId,
      openedAt: new Date(),
      // Remove any fields that might cause serialization issues
      creator: undefined,
      "dc:creator": undefined,
      categories: undefined,
      isoDate: undefined,
    };
    const result = await db.collection("history").insertOne(serializedItem);
    return { success: true, historyId: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding to history:", error);
    return { success: false, error: "Failed to add to history" };
  }
}

export async function getHistory(userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const history = await db
      .collection("history")
      .find({ userId })
      .sort({ openedAt: -1 })
      .toArray();

    // Convert ObjectId to string and remove any non-serializable fields
    const serializedHistory = history.map((item) => ({
      ...item,
      _id: item._id.toString(),
      userId: item.userId.toString(),
      openedAt: item.openedAt.toISOString(),
      // Remove any fields that might cause serialization issues
      creator: undefined,
      "dc:creator": undefined,
      categories: undefined,
      isoDate: undefined,
    }));

    return { success: true, history: serializedHistory };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}

export async function fetchAllFeeds(
  userId: string,
  page: number = 1,
  itemsPerPage: number = 10
) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const feeds = await db.collection("feeds").find({ userId }).toArray();

    let allItems: any[] = [];
    for (const feed of feeds) {
      const feedData = await parser.parseURL(feed.url);
      allItems = [...allItems, ...feedData.items];
    }

    // Sort all items by date
    allItems.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    return {
      success: true,
      feed: {
        items: paginatedItems,
      },
      hasMore: endIndex < allItems.length,
    };
  } catch (error) {
    console.error("Error fetching all feeds:", error);
    return { success: false, error: "Failed to fetch all feeds" };
  }
}

export async function forgotPassword(email: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "forgot-password", email }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to send reset email" };
    }

    const result = await response.json();
    return { 
      success: true, 
      message: result.message,
      resetToken: result.resetToken // In production, this would be sent via email
    };
  } catch (error) {
    console.error("Error sending reset email:", error);
    return { success: false, error: "Failed to send reset email" };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to reset password" };
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
