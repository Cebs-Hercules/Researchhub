import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import Blog from "@/models/Blog";
import { BLOG_STATUS } from "@/lib/blogs";

// Prevent this route from being prerendered
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      pdfUrl,
      pdfFilename,
      abstract,
      keywords,
      authors,
      doi,
      link,
    } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { message: "PDF is required for research papers" },
        { status: 400 }
      );
    }

    if (!abstract) {
      return NextResponse.json(
        { message: "Abstract is required for research papers" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newBlog = new Blog({
      title,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      status: BLOG_STATUS.DRAFT,
      reviewHistory: [],
      pdfUrl,
      pdfFilename,
      abstract,
      keywords,
      authors,
      doi,
      link,
    });

    await newBlog.save();

    return NextResponse.json(
      {
        message: "Research paper created successfully",
        blog: {
          ...newBlog.toObject(),
          _id: newBlog._id.toString(),
          id: newBlog._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating research paper:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a GET method to fetch blogs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");
    const status = searchParams.get("status");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    // Build the query
    const query = {};

    if (authorId) {
      query["author.id"] = authorId;
    }

    if (status) {
      query.status = status;
    }

    // Execute the query
    const totalResults = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format the results
    const formattedResults = blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
      id: blog._id.toString(),
    }));

    return NextResponse.json({
      blogs: formattedResults,
      pagination: {
        total: totalResults,
        page,
        limit,
        pages: Math.ceil(totalResults / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
