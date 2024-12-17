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
//   const history = db.history.filter((h: any) => h.userId === parseInt(userId as string))

//   return NextResponse.json(history)
// }

// export async function POST(request: Request) {
//   const historyItem = await request.json()

//   const db = readDB()
//   const newHistoryItem = { id: db.history.length + 1, ...historyItem }
//   db.history.push(newHistoryItem)
//   writeDB(db)

//   return NextResponse.json(newHistoryItem)
// }

// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId");

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const history = await db
//     .collection("history")
//     .find({ userId: parseInt(userId as string) })
//     .toArray();

//   return NextResponse.json(history);
// }

// export async function POST(request: Request) {
//   const historyItem = await request.json();

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const result = await db.collection("history").insertOne(historyItem);

//   return NextResponse.json({ id: result.insertedId, ...historyItem });
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
  const history = await db.collection("history").find({ userId }).toArray();

  return NextResponse.json(history);
}

export async function POST(request: Request) {
  const historyItem = await request.json();

  if (!historyItem.userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("rssReader");
  const result = await db.collection("history").insertOne(historyItem);

  return NextResponse.json({
    id: result.insertedId.toString(),
    ...historyItem,
  });
}
