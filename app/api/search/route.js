import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import Blog from "@/models/Blog"
import { BLOG_STATUS } from "@/lib/blogs"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const status = searchParams.get("status")
    const authorId = searchParams.get("authorId")
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const skip = (page - 1) * limit

    if (!query && !status && !authorId) {
      return NextResponse.json({ message: "No search parameters provided" }, { status: 400 })
    }

    await connectToDatabase()

    // Build the search query
    const searchQuery = {}

    // Text search if query is provided
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { abstract: { $regex: query, $options: "i" } },
        { keywords: { $regex: query, $options: "i" } },
        { "author.name": { $regex: query, $options: "i" } },
        { authors: { $regex: query, $options: "i" } },
      ]
    }

    // Filter by status if provided
    if (status) {
      // For public searches, only allow published papers
      if (status === "public") {
        searchQuery.status = BLOG_STATUS.PUBLISHED
      } else {
        searchQuery.status = status
      }
    }

    // Filter by author if provided
    if (authorId) {
      searchQuery["author.id"] = authorId
    }

    // Execute the search
    const totalResults = await Blog.countDocuments(searchQuery)
    const results = await Blog.find(searchQuery).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()

    // Format the results
    const formattedResults = results.map((paper) => ({
      ...paper,
      _id: paper._id.toString(),
      id: paper._id.toString(),
    }))

    return NextResponse.json({
      results: formattedResults,
      pagination: {
        total: totalResults,
        page,
        limit,
        pages: Math.ceil(totalResults / limit),
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
