import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { hashPassword } from "@/lib/auth"
import User from "@/models/User"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

// Function to validate UPSA email format
function isValidUPSAEmail(email) {
  // Check if email is from upsamail.edu.gh domain
  if (!email.endsWith("@upsamail.edu.gh")) {
    return false
  }

  // Get the part before @ symbol
  const localPart = email.split("@")[0]

  // Check if the local part contains any numbers (student emails)
  if (/\d/.test(localPart)) {
    return false
  }

  return true
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 422 })
    }

    // Validate UPSA email format
    if (!isValidUPSAEmail(email)) {
      return NextResponse.json(
        {
          message: "Only UPSA faculty emails are allowed. Student emails are not permitted.",
        },
        { status: 422 },
      )
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 422 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Lecturer", // Default role for new users
    })

    return NextResponse.json({ message: "User created successfully", userId: user._id }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Explicitly define that this route should not be prerendered
export const config = {
  api: {
    bodyParser: true,
  },
}
