import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { getCurrentUser } from "@/lib/auth"
import User from "@/models/User"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const userProfile = await User.findById(user.id).lean()

    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...userProfile,
        _id: userProfile._id.toString(),
        id: userProfile._id.toString(),
        password: undefined, // Remove password from the response
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const userProfile = await User.findById(user.id)

    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const { name, department, position, bio, institution, researchInterests } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    userProfile.name = name
    userProfile.department = department || ""
    userProfile.position = position || ""
    userProfile.bio = bio || ""
    userProfile.institution = institution || ""
    userProfile.researchInterests = researchInterests || []

    await userProfile.save()

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        ...userProfile.toObject(),
        _id: userProfile._id.toString(),
        id: userProfile._id.toString(),
        password: undefined,
      },
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
