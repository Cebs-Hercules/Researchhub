import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import User from "@/models/User"
import Blog from "@/models/Blog"
import { BLOG_STATUS } from "@/lib/blogs"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const department = searchParams.get("department")
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const skip = (page - 1) * limit

    await connectToDatabase()

    // Build the search query
    const searchQuery = { role: "Lecturer" }

    // Text search if query is provided
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
        { position: { $regex: query, $options: "i" } },
        { institution: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { researchInterests: { $regex: query, $options: "i" } },
      ]
    }

    // Filter by department if provided
    if (department) {
      searchQuery.department = department
    }

    // Get all unique departments for filtering
    const departments = await User.distinct("department", {
      role: "Lecturer",
      department: { $exists: true, $ne: "" },
    })

    // Execute the search
    const totalResults = await User.countDocuments(searchQuery)
    const researchers = await User.find(searchQuery)
      .select("_id name email department position institution bio researchInterests")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get publication counts for each researcher
    const researcherIds = researchers.map((r) => r._id.toString())
    const publicationCounts = await Blog.aggregate([
      {
        $match: {
          "author.id": { $in: researcherIds },
          status: BLOG_STATUS.PUBLISHED,
        },
      },
      {
        $group: {
          _id: "$author.id",
          count: { $sum: 1 },
        },
      },
    ])

    // Map publication counts to researchers
    const publicationCountMap = publicationCounts.reduce((map, item) => {
      map[item._id] = item.count
      return map
    }, {})

    // Format the results
    const formattedResults = researchers.map((researcher) => ({
      ...researcher,
      _id: researcher._id.toString(),
      id: researcher._id.toString(),
      publicationCount: publicationCountMap[researcher._id.toString()] || 0,
      password: undefined, // Remove password from the response
    }))

    return NextResponse.json({
      researchers: formattedResults,
      departments,
      pagination: {
        total: totalResults,
        page,
        limit,
        pages: Math.ceil(totalResults / limit),
      },
    })
  } catch (error) {
    console.error("Researchers search error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
