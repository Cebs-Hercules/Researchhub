import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { getCurrentUser, ROLES } from "@/lib/auth"
import User from "@/models/User"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser()

    // if (!user) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    // if (user.role !== ROLES.SUPER_ADMIN) {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    // }

    await connectToDatabase()

    const targetUser = await User.findById(params.id).lean()

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...targetUser,
        _id: targetUser._id.toString(),
        id: targetUser._id.toString(),
        password: undefined, // Remove password from the response
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await connectToDatabase()

    const targetUser = await User.findById(params.id)

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const { name, email, role } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json({ message: "Name, email, and role are required" }, { status: 400 })
    }

    // Check if email is already taken by another user
    if (email !== targetUser.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: params.id },
      })

      if (existingUser) {
        return NextResponse.json({ message: "Email is already in use" }, { status: 400 })
      }
    }

    targetUser.name = name
    targetUser.email = email
    targetUser.role = role

    await targetUser.save()

    return NextResponse.json({
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
