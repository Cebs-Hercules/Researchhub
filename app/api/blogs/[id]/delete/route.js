import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { getCurrentUser } from "@/lib/auth"
import Blog from "@/models/Blog"
import { deletePdfFromBlob } from "@/app/actions/blob-actions"

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    if (user.role !== "Super-Admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    await connectToDatabase()

    const blog = await Blog.findById(params.id)

    if (!blog) {
      return NextResponse.redirect(new URL("/dashboard/admin/blogs?error=Blog not found", request.url))
    }

    // If it's a research paper with a PDF, delete the PDF from Vercel Blob
    if (blog.pdfFilename) {
      try {
        await deletePdfFromBlob(blog.pdfFilename)
      } catch (error) {
        console.error("Error deleting PDF:", error)
        // Continue with the deletion even if PDF deletion fails
      }
    }

    await Blog.findByIdAndDelete(params.id)

    return NextResponse.redirect(new URL("/dashboard/admin/blogs?success=Blog deleted successfully", request.url))
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.redirect(
      new URL(`/dashboard/admin/blogs?error=Failed to delete blog: ${error.message}`, request.url),
    )
  }
}
