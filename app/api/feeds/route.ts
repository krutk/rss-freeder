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
