import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { getCurrentUser } from "@/lib/auth"
import Blog from "@/models/Blog"
import { BLOG_STATUS } from "@/lib/blogs"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const blog = await Blog.findById(params.id)

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 })
    }

    if (blog.author.id !== user.id) {
      return NextResponse.json(
        { message: "You are not authorized to submit this blog for verification" },
        { status: 403 },
      )
    }

    if (blog.status !== BLOG_STATUS.DRAFT) {
      return NextResponse.json({ message: "Only draft blogs can be submitted for verification" }, { status: 400 })
    }

    let nextStatus

    switch (user.role) {
      case "Lecturer":
        nextStatus = BLOG_STATUS.PENDING_DRO
        break
      case "Department Research Officer":
        nextStatus = BLOG_STATUS.PENDING_ADMIN
        break
      default:
        throw new Error("Invalid role for verification submission")
    }

    blog.status = nextStatus
    blog.verificationHistory.push({
      status: nextStatus,
      date: new Date(),
      role: user.role,
    })

    await blog.save()

    return NextResponse.json({
      message: "Blog submitted for verification successfully",
      status: nextStatus,
    })
  } catch (error) {
    console.error("Error submitting blog for verification:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
