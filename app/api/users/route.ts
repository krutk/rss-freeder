import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  // Ensure the URL is absolute
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url, baseUrl);

  const username = searchParams.get("username");
  const password = searchParams.get("password");
  const email = searchParams.get("email");

  const client = await clientPromise;
  const db = client.db("rssReader");
  
  // Support login with either username or email
  const user = await db.collection("users").findOne({
    $or: [
      { username, password },
      { email, password }
    ]
  });

  if (user) {
    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const { username, email, password } = await request.json();

  const client = await clientPromise;
  const db = client.db("rssReader");
  
  // Check if username or email already exists
  const existingUser = await db.collection("users").findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Username or email already exists" },
      { status: 400 }
    );
  }

  const result = await db.collection("users").insertOne({ 
    username, 
    email, 
    password 
  });
  const newUser = { 
    id: result.insertedId.toString(), 
    username, 
    email 
  };

  // Send welcome email (don't fail registration if email fails)
  try {
    await sendWelcomeEmail(email, username);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Continue with registration even if email fails
  }

  return NextResponse.json(newUser);
}

export async function PUT(request: Request) {
  const { action, email, token, newPassword } = await request.json();

  const client = await clientPromise;
  const db = client.db("rssReader");

  if (action === "forgot-password") {
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry
        }
      }
    );

    // Send password reset email
    const emailResult = await sendPasswordResetEmail({
      email,
      resetToken,
      username: user.username
    });

    if (!emailResult.success) {
      return NextResponse.json({ 
        error: "Failed to send reset email. Please try again." 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Password reset email sent successfully. Please check your inbox."
    });
  }

  if (action === "reset-password") {
    // Verify token and reset password
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { password: newPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    return NextResponse.json({ message: "Password reset successful" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
