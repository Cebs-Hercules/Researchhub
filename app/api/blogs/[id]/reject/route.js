import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { getCurrentUser, ROLES } from "@/lib/auth"
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

    // Check if user has verification permissions
    if (![ROLES.DRO, ROLES.SUPER_ADMIN].includes(user.role)) {
      return NextResponse.json({ message: "You do not have permission to reject blogs" }, { status: 403 })
    }

    await connectToDatabase()

    const blog = await Blog.findById(params.id)

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 })
    }

    // Check if the blog is in the correct status for this verifier
    let canVerify = false

    switch (user.role) {
      case ROLES.DRO:
        canVerify = blog.status === BLOG_STATUS.PENDING_DRO
        break
      case ROLES.SUPER_ADMIN:
        canVerify = blog.status === BLOG_STATUS.PENDING_ADMIN
        break
    }

    if (!canVerify) {
      return NextResponse.json({ message: "This blog is not pending your verification" }, { status: 400 })
    }

    const { comments } = await request.json()

    if (!comments) {
      return NextResponse.json({ message: "Rejection feedback is required" }, { status: 400 })
    }

    blog.status = BLOG_STATUS.REJECTED
    blog.verificationHistory.push({
      status: BLOG_STATUS.REJECTED,
      date: new Date(),
      role: user.role,
      verifierId: user.id,
      verifierName: user.name,
      comments,
    })

    await blog.save()

    return NextResponse.json({
      message: "Blog rejected successfully",
      status: BLOG_STATUS.REJECTED,
    })
  } catch (error) {
    console.error("Error rejecting blog:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
