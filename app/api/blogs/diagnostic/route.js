import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { getCurrentUser } from "@/lib/auth"
import Blog from "@/models/Blog"
import mongoose from "mongoose"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only allow admins to access this diagnostic endpoint
    if (user.role !== "Super-Admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await connectToDatabase()

    // Get the search params
    const { searchParams } = new URL(request.url)
    const blogId = searchParams.get("id")

    // Check MongoDB connection status
    const connectionStatus = {
      state: mongoose.connection.readyState,
      stateDescription:
        ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    }

    // If a specific blog ID is provided, try to fetch it
    let blogData = null
    let error = null

    if (blogId) {
      try {
        const blog = await Blog.findById(blogId).lean()

        if (blog) {
          blogData = {
            id: blog._id.toString(),
            title: blog.title,
            status: blog.status,
            authorId: blog.author.id,
            authorName: blog.author.name,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
          }
        } else {
          error = "Blog not found with the provided ID"
        }
      } catch (err) {
        error = `Error fetching blog: ${err.message}`
      }
    }

    // Get a count of blogs in the database
    const blogCount = await Blog.countDocuments()

    // Get the most recent 5 blogs for diagnostic purposes
    const recentBlogs = await Blog.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean()
      .then((blogs) =>
        blogs.map((blog) => ({
          id: blog._id.toString(),
          title: blog.title,
          status: blog.status,
          updatedAt: blog.updatedAt,
        })),
      )

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      database: {
        connection: connectionStatus,
        blogCount,
      },
      requestedBlog: blogId ? { id: blogId, data: blogData, error } : null,
      recentBlogs,
    })
  } catch (error) {
    console.error("Diagnostic error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
