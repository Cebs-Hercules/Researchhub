import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import Blog from "@/models/Blog";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    console.log("Fetching research paper with ID:", params);

    const blogId = params?.id;
    if (!blogId) {
      return NextResponse.json(
        { message: "Research paper ID is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return NextResponse.json(
        { message: "Research paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error getting research paper:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update the PUT method to handle Vercel Blob
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const blog = await Blog.findById(params.id);

    if (!blog) {
      return NextResponse.json(
        { message: "Research paper not found" },
        { status: 404 }
      );
    }

    if (blog.author.id !== user.id) {
      return NextResponse.json(
        { message: "You are not authorized to update this research paper" },
        { status: 403 }
      );
    }

    if (blog.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Only draft research papers can be updated" },
        { status: 400 }
      );
    }

    const { title, pdfUrl, pdfFilename, abstract, keywords, authors, doi } =
      await request.json();

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

    // Note: The old PDF deletion is now handled in the client component

    blog.title = title;
    blog.pdfUrl = pdfUrl;
    blog.pdfFilename = pdfFilename;
    blog.abstract = abstract;
    blog.keywords = keywords;
    blog.authors = authors;
    blog.doi = doi;

    await blog.save();

    return NextResponse.json({
      message: "Research paper updated successfully",
    });
  } catch (error) {
    console.error("Error updating research paper:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
