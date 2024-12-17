// import { NextResponse } from 'next/server'
// import fs from 'fs'
// import path from 'path'

// const DB_PATH = path.join(process.cwd(), 'db.json')

// function readDB() {
//   const data = fs.readFileSync(DB_PATH, 'utf-8')
//   return JSON.parse(data)
// }

// function writeDB(data: any) {
//   fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
// }

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)
//   const userId = searchParams.get('userId')

//   const db = readDB()
//   const feeds = db.feeds.filter((f: any) => f.userId === parseInt(userId as string))

//   return NextResponse.json(feeds)
// }

// export async function POST(request: Request) {
//   const { url, userId } = await request.json()

//   const db = readDB()
//   const newFeed = { id: db.feeds.length + 1, url, userId }
//   db.feeds.push(newFeed)
//   writeDB(db)

//   return NextResponse.json(newFeed)
// }

// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId");

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const feeds = await db
//     .collection("feeds")
//     .find({ userId: parseInt(userId as string) })
//     .toArray();

//   return NextResponse.json(feeds);
// }

// export async function POST(request: Request) {
//   const { url, userId } = await request.json();

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const result = await db.collection("feeds").insertOne({ url, userId });

//   return NextResponse.json({ id: result.insertedId, url, userId });
// }

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("rssReader");
  const feeds = await db.collection("feeds").find({ userId }).toArray();

  return NextResponse.json(feeds);
}

export async function POST(request: Request) {
  const { url, userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("rssReader");
  const result = await db.collection("feeds").insertOne({ url, userId });

  return NextResponse.json({ id: result.insertedId.toString(), url, userId });
}
