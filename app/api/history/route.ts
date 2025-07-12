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
