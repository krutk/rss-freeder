"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Parser from "rss-parser";

const parser = new Parser();

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

export async function registerUser(username: string, email: string, password: string) {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to register user" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(
      `/api/users?email=${email}&password=${password}`
    );
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to login" };
    }
    const user = await response.json();
    return { success: true, user };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: "Failed to login" };
  }
}

export async function forgotPassword(email: string) {
  try {
    const response = await fetch("/api/users", {
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
    const response = await fetch("/api/users", {
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

export async function addFeed(url: string, userId: number) {
  try {
    const response = await fetch("/api/feeds", {
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

export async function getFeeds(userId: number) {
  try {
    const response = await fetch(`/api/feeds?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch feeds");
    const feeds = await response.json();
    return { success: true, feeds };
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return { success: false, error: "Failed to fetch feeds" };
  }
}

export async function addToHistory(item: any, userId: number) {
  try {
    const response = await fetch("/api/history", {
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

export async function getHistory(userId: number) {
  try {
    const response = await fetch(`/api/history?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch history");
    const history = await response.json();
    return { success: true, history };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}

export async function addBookmark(item: any, userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const result = await db.collection("bookmarks").insertOne({
      userId,
      title: item.title,
      link: item.link,
      contentSnippet: item.contentSnippet,
      feedUrl: item.feedUrl,
      createdAt: new Date(),
    });
    return { success: true, bookmarkId: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return { success: false, error: "Failed to add bookmark" };
  }
}

export async function removeBookmark(bookmarkId: string, userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const result = await db.collection("bookmarks").deleteOne({
      _id: new ObjectId(bookmarkId),
      userId,
    });
    if (result.deletedCount === 0) {
      return { success: false, error: "Bookmark not found or unauthorized" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return { success: false, error: "Failed to remove bookmark" };
  }
}

export async function getBookmarks(userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const bookmarks = await db
      .collection("bookmarks")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return {
      success: true,
      bookmarks: bookmarks.map((bookmark) => ({
        ...bookmark,
        _id: bookmark._id.toString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return { success: false, error: "Failed to fetch bookmarks" };
  }
}

export async function isBookmarked(userId: string, link: string) {
  try {
    const client = await clientPromise;
    const db = client.db("rssReader");
    const bookmark = await db.collection("bookmarks").findOne({ userId, link });
    return { success: true, isBookmarked: !!bookmark };
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return { success: false, error: "Failed to check bookmark status" };
  }
}
