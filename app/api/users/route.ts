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
//   const username = searchParams.get('username')
//   const password = searchParams.get('password')

//   const db = readDB()
//   const user = db.users.find((u: any) => u.username === username && u.password === password)

//   if (user) {
//     return NextResponse.json(user)
//   } else {
//     return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
//   }
// }

// export async function POST(request: Request) {
//   const { username, password } = await request.json()

//   const db = readDB()
//   const existingUser = db.users.find((u: any) => u.username === username)

//   if (existingUser) {
//     return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
//   }

//   const newUser = { id: db.users.length + 1, username, password }
//   db.users.push(newUser)
//   writeDB(db)

//   return NextResponse.json(newUser)
// }

// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const username = searchParams.get("username");
//   const password = searchParams.get("password");

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const user = await db.collection("users").findOne({ username, password });

//   if (user) {
//     return NextResponse.json(user);
//   } else {
//     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//   }
// }

// export async function POST(request: Request) {
//   console.log("asdf", { url: request });

//   const { username, password } = await request.json();

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const existingUser = await db.collection("users").findOne({ username });

//   if (existingUser) {
//     return NextResponse.json(
//       { error: "Username already exists" },
//       { status: 400 }
//     );
//   }

//   const result = await db.collection("users").insertOne({ username, password });
//   const newUser = { id: result.insertedId, username, password };

//   return NextResponse.json(newUser);
// }

// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const username = searchParams.get("username");
//   const password = searchParams.get("password");

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const user = await db.collection("users").findOne({ username, password });

//   if (user) {
//     return NextResponse.json({
//       id: user._id.toString(),
//       username: user.username,
//     });
//   } else {
//     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//   }
// }

// export async function POST(request: Request) {
//   const { username, password } = await request.json();

//   const client = await clientPromise;
//   const db = client.db("rssReader");
//   const existingUser = await db.collection("users").findOne({ username });

//   if (existingUser) {
//     return NextResponse.json(
//       { error: "Username already exists" },
//       { status: 400 }
//     );
//   }

//   const result = await db.collection("users").insertOne({ username, password });
//   const newUser = { id: result.insertedId.toString(), username };

//   return NextResponse.json(newUser);
// }

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  // Ensure the URL is absolute
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url, baseUrl);

  const username = searchParams.get("username");
  const password = searchParams.get("password");

  const client = await clientPromise;
  const db = client.db("rssReader");
  const user = await db.collection("users").findOne({ username, password });

  if (user) {
    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
    });
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const client = await clientPromise;
  const db = client.db("rssReader");
  const existingUser = await db.collection("users").findOne({ username });

  if (existingUser) {
    return NextResponse.json(
      { error: "Username already exists" },
      { status: 400 }
    );
  }

  const result = await db.collection("users").insertOne({ username, password });
  const newUser = { id: result.insertedId.toString(), username };

  return NextResponse.json(newUser);
}
